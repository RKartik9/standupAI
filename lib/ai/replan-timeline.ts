import * as z from "zod";
import { AI_MODEL, getOpenAI } from "./client";
import {
  clampToCalendar,
  describeCalendarRules,
  hoursPerDay,
  nextFreeSlot,
  packTasks,
  toIsoInOrgZone,
  type TimeRange,
  type WorkCalendar,
} from "@/lib/scheduling/calendar";

export type ReplanTask = {
  id: string;
  title: string;
  priority: number;
  estimateHours: number;
  createdAt: Date;
  scheduledStart: Date;
  scheduledEnd: Date;
};

export type ReplanInput = {
  assigneeName: string;
  calendar: WorkCalendar;
  now: Date;
  /** in_progress work: immovable. */
  fixed: ReplanTask[];
  /** todo work: may be re-dated. */
  movable: ReplanTask[];
  /** Why we are re-planning (fed to the model for its reasons). */
  trigger: string;
};

export type ReplanResult = {
  placements: Map<string, TimeRange & { reason: string }>;
  usedFallback: boolean;
};

const responseSchema = z.object({
  placements: z
    .array(
      z.object({
        id: z.string(),
        scheduledStart: z.string(),
        reason: z.string().nullable().default(null),
      }),
    )
    .max(200),
});

function buildPrompt(input: ReplanInput): string {
  const cal = input.calendar;
  const fmt = (d: Date) => toIsoInOrgZone(d, cal);

  const fixedLines = input.fixed.length
    ? input.fixed
        .map(
          (t) =>
            `- [in_progress, DO NOT MOVE] "${t.title}" ${fmt(t.scheduledStart)} → ${fmt(t.scheduledEnd)}`,
        )
        .join("\n")
    : "- (none)";

  const movableLines = input.movable
    .map(
      (t) =>
        `- id=${t.id} P${t.priority} "${t.title}" ${t.estimateHours}h (currently ${fmt(t.scheduledStart)} → ${fmt(t.scheduledEnd)})`,
    )
    .join("\n");

  return `You are re-planning the personal timeline of ${input.assigneeName}.
Reason for re-planning: ${input.trigger}
NOW: ${fmt(input.now)}

ORGANIZATION WORKING CALENDAR (authoritative):
${describeCalendarRules(cal, input.now)}
1 working day = ${hoursPerDay(cal)} hours.

IMMOVABLE WORK:
${fixedLines}

TASKS TO PLACE (all are unstarted):
${movableLines}

RULES
- Order by priority (P1 first, P4 last); for equal priority keep the earlier-created task first.
- Each task starts at the earliest free working time after NOW that does not overlap immovable work or a task you already placed.
- Start times must be inside working hours on working days and never on holidays.
- Return one placement per task id with an ISO 8601 "scheduledStart" (with timezone offset) and a one-sentence "reason" written for the team (e.g. "Moved after the critical auth fix").

Respond ONLY with JSON: {"placements":[{"id":"...","scheduledStart":"...","reason":"..."}]}`;
}

/**
 * Ask the model for an ordering + start times, then enforce the calendar:
 * snap each start, recompute the end from the estimate, and push anything
 * that collides forward to the next free slot. If the model output is
 * unusable we fall back to the deterministic packer.
 */
export async function replanAssigneeTimeline(
  input: ReplanInput,
): Promise<ReplanResult> {
  const cal = input.calendar;
  const busy: TimeRange[] = input.fixed.map((t) => ({
    start: t.scheduledStart,
    end: t.scheduledEnd,
  }));

  if (input.movable.length === 0) {
    return { placements: new Map(), usedFallback: false };
  }

  const fallback = (): ReplanResult => {
    const packed = packTasks(
      input.movable.map((t) => ({
        id: t.id,
        estimateHours: t.estimateHours,
        priority: t.priority,
        createdAt: t.createdAt,
      })),
      input.now,
      busy,
      cal,
    );
    const placements = new Map<string, TimeRange & { reason: string }>();
    for (const [id, range] of packed) {
      placements.set(id, { ...range, reason: input.trigger });
    }
    return { placements, usedFallback: true };
  };

  let aiPlacements: z.infer<typeof responseSchema>["placements"];
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      temperature: 0.1,
      messages: [{ role: "system", content: buildPrompt(input) }],
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message.content ?? "{}";
    const parsed = responseSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return fallback();
    aiPlacements = parsed.data.placements;
  } catch {
    return fallback();
  }

  const byId = new Map(input.movable.map((t) => [t.id, t]));
  const seen = new Set<string>();
  const proposals: Array<{ task: ReplanTask; start: Date; reason: string }> =
    [];

  for (const p of aiPlacements) {
    const task = byId.get(p.id);
    if (!task || seen.has(p.id)) continue;
    seen.add(p.id);
    const start = new Date(p.scheduledStart);
    proposals.push({
      task,
      start: Number.isNaN(start.getTime()) ? input.now : start,
      reason: p.reason?.trim() || input.trigger,
    });
  }

  // Any task the model forgot goes to the end, in priority order.
  const missing = input.movable
    .filter((t) => !seen.has(t.id))
    .sort(
      (a, b) =>
        a.priority - b.priority ||
        a.createdAt.getTime() - b.createdAt.getTime(),
    );
  for (const task of missing) {
    proposals.push({ task, start: input.now, reason: input.trigger });
  }

  // Priority order is a hard rule and is enforced here; the model's proposed
  // start only breaks ties inside a priority tier. Each task is then packed
  // into the earliest free working window after NOW, so the calendar and
  // collisions are always corrected by code.
  const modelRank = new Map(proposals.map((p, i) => [p.task.id, i]));
  proposals.sort(
    (a, b) =>
      a.task.priority - b.task.priority ||
      a.start.getTime() - b.start.getTime() ||
      a.task.createdAt.getTime() - b.task.createdAt.getTime(),
  );
  const occupied = [...busy];
  const placements = new Map<string, TimeRange & { reason: string }>();
  const floor = clampToCalendar(null, 0, input.now, cal).start;

  proposals.forEach(({ task, reason }, finalRank) => {
    const slot = nextFreeSlot(occupied, floor, task.estimateHours, cal);
    occupied.push(slot);
    // If we had to reorder the model's plan, its prose may describe the
    // wrong neighbour — fall back to the factual trigger text.
    const reordered = modelRank.get(task.id) !== finalRank;
    placements.set(task.id, {
      ...slot,
      reason: reordered ? input.trigger : reason,
    });
  });

  return { placements, usedFallback: false };
}
