import * as z from "zod";
import { AI_MODEL, getOpenAI } from "./client";
import {
  describeCalendarRules,
  hoursPerDay,
  toIsoInOrgZone,
  type WorkCalendar,
} from "@/lib/scheduling/calendar";

export type ParseMember = {
  userId: string;
  name: string;
  teams: string[];
};

export type ParseExistingTask = {
  assigneeName: string;
  title: string;
  priority: number;
  status: string;
  start: Date;
  end: Date;
  estimateHours: number;
};

export type ParseContext = {
  input: string;
  projectName: string;
  projectStart: Date;
  now: Date;
  calendar: WorkCalendar;
  members: ParseMember[];
  teams: { id: string; name: string }[];
  existingTasks: ParseExistingTask[];
};

const parsedTaskSchema = z.object({
  title: z.string().min(1).max(200),
  assigneeName: z.string().nullable().default(null),
  teamName: z.string().nullable().default(null),
  estimateHours: z.number().positive().max(2000).nullable().default(null),
  priority: z.number().int().min(1).max(4).default(3),
  scheduledStart: z.string().nullable().default(null),
  scheduledEnd: z.string().nullable().default(null),
  startConstraint: z.string().nullable().default(null),
  confidence: z.number().min(0).max(1).default(0.5),
  reason: z.string().nullable().default(null),
});

const responseSchema = z.object({
  tasks: z.array(parsedTaskSchema).max(25),
});

export type ParsedTask = z.infer<typeof parsedTaskSchema>;

function priorityWord(p: number) {
  return ["", "critical", "high", "normal", "low"][p] ?? "normal";
}

export function buildParseSystemPrompt(ctx: ParseContext): string {
  const hpd = hoursPerDay(ctx.calendar);

  const memberLines = ctx.members
    .map(
      (m) =>
        `- ${m.name}${m.teams.length ? ` (teams: ${m.teams.join(", ")})` : ""}`,
    )
    .join("\n");

  const teamLines = ctx.teams.length
    ? ctx.teams.map((t) => `- ${t.name}`).join("\n")
    : "- (no teams created yet)";

  const byAssignee = new Map<string, ParseExistingTask[]>();
  for (const t of ctx.existingTasks) {
    if (!byAssignee.has(t.assigneeName)) byAssignee.set(t.assigneeName, []);
    byAssignee.get(t.assigneeName)!.push(t);
  }
  const existingLines = [...byAssignee.entries()]
    .map(([name, list]) => {
      const rows = list
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .map(
          (t) =>
            `    • [${t.status}] P${t.priority} ${priorityWord(t.priority)} — "${t.title}" (${t.estimateHours}h) ${toIsoInOrgZone(t.start, ctx.calendar)} → ${toIsoInOrgZone(t.end, ctx.calendar)}`,
        )
        .join("\n");
      return `  ${name}:\n${rows}`;
    })
    .join("\n");

  return `You are a project scheduling assistant for a company workspace.
Convert the user's natural-language request into concrete tasks, each assigned to ONE existing member, with an estimate, a priority, and a scheduled start/end datetime that respects this organization's working calendar.

PROJECT: "${ctx.projectName}" (starts ${toIsoInOrgZone(ctx.projectStart, ctx.calendar)})
NOW: ${toIsoInOrgZone(ctx.now, ctx.calendar)}

ORGANIZATION WORKING CALENDAR (authoritative — set by the customer's admin):
${describeCalendarRules(ctx.calendar, ctx.now)}
"1 day" of work = ${hpd} hours. "Half day" = ${hpd / 2} hours.

MEMBERS (assign only to these people, using their exact name as written here):
${memberLines || "- (no members)"}

TEAMS (only mention a teamName if the request names one of these, or the assignee belongs to exactly one team):
${teamLines}

EXISTING OPEN WORK (do not overlap these windows for the same person):
${existingLines || "  (none)"}

RULES
- Split the request into one task per distinct piece of work. Keep titles short and specific.
- "assigneeName" must be one of the MEMBERS names, or null if no person is named. Do not invent people.
- "estimateHours": read phrases like "2 days", "half a day", "3 hours". Default to ${hpd} (one day) when unspecified.
- "priority": 1 = critical/urgent/asap/blocker, 2 = high/important, 3 = normal (default), 4 = low/whenever.
- "scheduledStart"/"scheduledEnd": ISO 8601 with timezone offset, inside working hours, on working days, never on holidays, never overlapping the same person's existing in_progress work.
  Every person has their OWN independent queue and people work in parallel: never delay one person's task because of another person's task.
  Higher-priority tasks go in the EARLIEST free slot for that person, even ahead of their existing lower-priority todo work (those will be re-planned afterwards). Lower or equal priority work goes after that person's existing work.
  Start at the earliest possible working time unless the request itself asks for a later start (e.g. "next Monday", "after the 25th").
  Never start before NOW or before the project start. A task that does not fit in the remaining hours of a day continues on the next working day.
- "startConstraint": the exact phrase from the request that fixes when the task may start (e.g. "next Monday", "after the 25th", "from October"), or null when the request gives no such timing.
- "confidence": 0–1, how sure you are about the assignee.
- "reason": one short sentence explaining the placement (e.g. "Placed first because it is critical; Priya's API review moves after it").

Respond ONLY with JSON: {"tasks":[{"title":"...","assigneeName":"...","teamName":null,"estimateHours":8,"priority":3,"scheduledStart":"...","scheduledEnd":"...","startConstraint":null,"confidence":0.9,"reason":"..."}]}`;
}

export async function parseTasksWithAI(
  ctx: ParseContext,
): Promise<ParsedTask[]> {
  const completion = await getOpenAI().chat.completions.create({
    model: AI_MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: buildParseSystemPrompt(ctx) },
      { role: "user", content: ctx.input },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message.content ?? "{}";
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error("AI returned malformed JSON");
  }

  const parsed = responseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("AI response did not match the expected task shape");
  }
  return parsed.data.tasks;
}
