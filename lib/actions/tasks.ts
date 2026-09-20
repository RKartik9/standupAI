"use server";

import { db } from "@/lib/db";
import {
  organizationMembers,
  projects,
  scheduleEvents,
  tasks,
  teamMembers,
  teams,
  users,
} from "@/lib/db/schema";
import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { alias } from "drizzle-orm/pg-core";
import {
  addWorkSchema,
  commitTasksSchema,
  taskPrioritySchema,
  taskStatusSchema,
  type TaskDraftInput,
} from "@/lib/validations/tasks";
import { requireOrgMember, requireUser } from "./org-auth";
import { getOrgCalendar, serializeCalendar } from "@/lib/scheduling/org-calendar";
import {
  clampToCalendar,
  hoursPerDay,
  nextFreeSlot,
  type TimeRange,
  type WorkCalendar,
} from "@/lib/scheduling/calendar";
import {
  parseTasksWithAI,
  type ParseExistingTask,
  type ParseMember,
} from "@/lib/ai/parse-tasks";
import {
  displayName,
  matchMember,
  matchTeamName,
  type MatchableMember,
} from "@/lib/ai/match-members";
import {
  loadOpenTasksFor,
  replanAssignee,
  replanAssignees,
} from "@/lib/scheduling/replan-service";

// ---------------------------------------------------------------------------
// Types shared with the UI
// ---------------------------------------------------------------------------

export type DraftAssignee =
  | { kind: "matched"; userId: string; name: string }
  | {
      kind: "ambiguous";
      rawName: string;
      candidates: { userId: string; name: string }[];
    }
  | { kind: "unmatched"; rawName: string | null };

export type WorkDraft = {
  key: string;
  title: string;
  estimateHours: number;
  priority: number;
  scheduledStart: string | null;
  reason: string | null;
  confidence: number;
  teamId: string | null;
  teamName: string | null;
  assignee: DraftAssignee;
  /** Where this task would land right now (only when assignee is matched). */
  preview: { start: string; end: string } | null;
};

// ---------------------------------------------------------------------------
// Context loading
// ---------------------------------------------------------------------------

async function loadProjectForMember(projectId: string) {
  const userId = await requireUser();
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) throw new Error("Project not found");
  await requireOrgMember(project.organizationId, userId);
  return { userId, project };
}

async function loadOrgPeopleAndTeams(organizationId: string) {
  const members = await db
    .select({
      userId: organizationMembers.userId,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      imageUrl: users.imageUrl,
    })
    .from(organizationMembers)
    .leftJoin(users, eq(organizationMembers.userId, users.id))
    .where(eq(organizationMembers.organizationId, organizationId));

  const orgTeams = await db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .where(and(eq(teams.organizationId, organizationId), eq(teams.archived, false)));

  const memberships =
    orgTeams.length > 0
      ? await db
          .select({ teamId: teamMembers.teamId, userId: teamMembers.userId })
          .from(teamMembers)
          .where(
            inArray(
              teamMembers.teamId,
              orgTeams.map((t) => t.id),
            ),
          )
      : [];

  const teamNameById = new Map(orgTeams.map((t) => [t.id, t.name]));
  const teamsByUser = new Map<string, { id: string; name: string }[]>();
  for (const m of memberships) {
    const name = teamNameById.get(m.teamId);
    if (!name) continue;
    if (!teamsByUser.has(m.userId)) teamsByUser.set(m.userId, []);
    teamsByUser.get(m.userId)!.push({ id: m.teamId, name });
  }

  return { members, orgTeams, teamsByUser };
}

/**
 * Place a new task into one person's queue:
 *  - in_progress work and equal/higher-priority todo work are immovable
 *  - the AI-proposed start is honoured if it is valid and free, otherwise the
 *    next free slot after it is used
 */
function placeNewTask(
  open: (typeof tasks.$inferSelect)[],
  priority: number,
  hours: number,
  proposedStart: Date | null,
  notBefore: Date,
  cal: WorkCalendar,
): TimeRange {
  const busy: TimeRange[] = open
    .filter(
      (t) =>
        t.status === "in_progress" ||
        (t.status === "todo" && t.priority <= priority),
    )
    .map((t) => ({ start: t.scheduledStart, end: t.scheduledEnd }));

  let slot = clampToCalendar(proposedStart, hours, notBefore, cal);
  if (busy.some((b) => slot.start < b.end && slot.end > b.start)) {
    slot = nextFreeSlot(busy, slot.start, hours, cal);
  }
  return slot;
}

// ---------------------------------------------------------------------------
// Preview: natural language → drafts (nothing saved)
// ---------------------------------------------------------------------------

export async function previewWork(projectId: string, rawInput: string) {
  const { project } = await loadProjectForMember(projectId);
  const parsed = addWorkSchema.safeParse({ input: rawInput });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.input?.[0] ?? "Invalid input" };
  }

  const organizationId = project.organizationId;
  const [cal, people] = await Promise.all([
    getOrgCalendar(organizationId),
    loadOrgPeopleAndTeams(organizationId),
  ]);
  const now = new Date();
  const notBefore = project.startDate > now ? project.startDate : now;

  const matchable: MatchableMember[] = people.members.map((m) => ({
    userId: m.userId,
    firstName: m.firstName,
    lastName: m.lastName,
    email: m.email,
  }));
  const nameById = new Map(matchable.map((m) => [m.userId, displayName(m)]));

  const parseMembers: ParseMember[] = matchable.map((m) => ({
    userId: m.userId,
    name: displayName(m),
    teams: (people.teamsByUser.get(m.userId) ?? []).map((t) => t.name),
  }));

  const open = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.organizationId, organizationId), ne(tasks.status, "done")));

  const existingTasks: ParseExistingTask[] = open.map((t) => ({
    assigneeName: nameById.get(t.assigneeId) ?? "Unknown",
    title: t.title,
    priority: t.priority,
    status: t.status,
    start: t.scheduledStart,
    end: t.scheduledEnd,
    estimateHours: t.estimateHours,
  }));

  let aiTasks;
  try {
    aiTasks = await parseTasksWithAI({
      input: parsed.data.input,
      projectName: project.name,
      projectStart: project.startDate,
      now,
      calendar: cal,
      members: parseMembers,
      teams: people.orgTeams,
      existingTasks,
    });
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? `Could not understand that request (${err.message}). Try rephrasing.`
          : "Could not understand that request. Try rephrasing.",
    };
  }

  if (aiTasks.length === 0) {
    return { error: "No tasks were found in that text. Try naming the work and who should do it." };
  }

  const defaultHours = hoursPerDay(cal);
  const drafts: WorkDraft[] = [];
  // Simulated queue so several drafts for the same person stack correctly.
  const simulated = new Map<string, (typeof tasks.$inferSelect)[]>();

  aiTasks.forEach((t, i) => {
    const estimateHours = t.estimateHours ?? defaultHours;
    const match = matchMember(t.assigneeName, matchable);
    // Only honour the model's start time when the request itself pinned one
    // ("next Monday", "after the 25th"); otherwise earliest free slot wins.
    const pinnedStart =
      t.startConstraint && t.scheduledStart ? t.scheduledStart : null;

    let assignee: DraftAssignee;
    if (match.kind === "matched") {
      assignee = {
        kind: "matched",
        userId: match.member.userId,
        name: displayName(match.member),
      };
    } else if (match.kind === "ambiguous") {
      assignee = {
        kind: "ambiguous",
        rawName: t.assigneeName ?? "",
        candidates: match.candidates.map((c) => ({
          userId: c.userId,
          name: displayName(c),
        })),
      };
    } else {
      assignee = { kind: "unmatched", rawName: t.assigneeName };
    }

    // Team: explicit mention wins; else the assignee's only team.
    let team = matchTeamName(t.teamName, people.orgTeams);
    if (!team && assignee.kind === "matched") {
      const theirs = people.teamsByUser.get(assignee.userId) ?? [];
      if (theirs.length === 1) team = theirs[0];
    }

    let preview: WorkDraft["preview"] = null;
    if (assignee.kind === "matched") {
      const uid = assignee.userId;
      if (!simulated.has(uid)) {
        simulated.set(uid, open.filter((o) => o.assigneeId === uid));
      }
      const queue = simulated.get(uid)!;
      const proposed = pinnedStart ? new Date(pinnedStart) : null;
      const slot = placeNewTask(queue, t.priority, estimateHours, proposed, notBefore, cal);
      preview = { start: slot.start.toISOString(), end: slot.end.toISOString() };
      queue.push({
        id: `draft-${i}`,
        projectId,
        organizationId,
        teamId: team?.id ?? null,
        title: t.title,
        rawInput: null,
        assigneeId: uid,
        estimateHours,
        priority: t.priority,
        status: "todo",
        scheduledStart: slot.start,
        scheduledEnd: slot.end,
        createdBy: "",
        createdAt: now,
        updatedAt: now,
      });
    }

    drafts.push({
      key: `${Date.now()}-${i}`,
      title: t.title,
      estimateHours,
      priority: t.priority,
      scheduledStart: pinnedStart,
      reason: t.reason,
      confidence: t.confidence,
      teamId: team?.id ?? null,
      teamName: team?.name ?? null,
      assignee,
      preview,
    });
  });

  return {
    data: {
      drafts,
      members: matchable.map((m) => ({ userId: m.userId, name: displayName(m) })),
      teams: people.orgTeams,
      calendar: serializeCalendar(cal),
    },
  };
}

// ---------------------------------------------------------------------------
// Commit: drafts → tasks (+ re-plan of lower-priority work)
// ---------------------------------------------------------------------------

export async function commitWork(projectId: string, drafts: TaskDraftInput[]) {
  const { userId, project } = await loadProjectForMember(projectId);
  const parsed = commitTasksSchema.safeParse({ drafts });
  if (!parsed.success) {
    return { error: "Every task needs a title and an assignee." };
  }

  const organizationId = project.organizationId;
  const cal = await getOrgCalendar(organizationId);
  const now = new Date();
  const notBefore = project.startDate > now ? project.startDate : now;

  // Assignees must be org members.
  const assigneeIds = [...new Set(parsed.data.drafts.map((d) => d.assigneeId))];
  const memberRows = await db
    .select({ userId: organizationMembers.userId })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        inArray(organizationMembers.userId, assigneeIds),
      ),
    );
  const memberSet = new Set(memberRows.map((m) => m.userId));
  const outsider = assigneeIds.find((id) => !memberSet.has(id));
  if (outsider) return { error: "One of the assignees is not in this organization." };

  // Teams must belong to the org.
  const teamIds = [...new Set(parsed.data.drafts.map((d) => d.teamId).filter(Boolean))] as string[];
  const validTeams = new Set(
    teamIds.length
      ? (
          await db
            .select({ id: teams.id })
            .from(teams)
            .where(and(eq(teams.organizationId, organizationId), inArray(teams.id, teamIds)))
        ).map((t) => t.id)
      : [],
  );

  const created: string[] = [];
  let moved = 0;

  for (const draft of parsed.data.drafts) {
    const open = await loadOpenTasksFor(organizationId, [draft.assigneeId]);
    const proposed = draft.scheduledStart ? new Date(draft.scheduledStart) : null;
    const slot = placeNewTask(open, draft.priority, draft.estimateHours, proposed, notBefore, cal);

    const [task] = await db
      .insert(tasks)
      .values({
        projectId,
        organizationId,
        teamId: draft.teamId && validTeams.has(draft.teamId) ? draft.teamId : null,
        title: draft.title,
        rawInput: draft.rawInput,
        assigneeId: draft.assigneeId,
        estimateHours: draft.estimateHours,
        priority: draft.priority,
        status: "todo",
        scheduledStart: slot.start,
        scheduledEnd: slot.end,
        createdBy: userId,
      })
      .returning();
    created.push(task.id);

    // Initial placement is itself an event so the timeline can explain it.
    await db.insert(scheduleEvents).values({
      organizationId,
      projectId,
      taskId: task.id,
      triggeredByTaskId: null,
      previousStart: null,
      previousEnd: null,
      newStart: slot.start,
      newEnd: slot.end,
      reason: draft.reason?.trim() || `Scheduled "${task.title}" (P${task.priority})`,
    });

    // Lower-priority unstarted work that this task collides with, or that
    // now comes after it, is re-dated by AI.
    moved += await replanAssignee(organizationId, draft.assigneeId, {
      trigger: `"${task.title}" (P${task.priority}) was added ahead of lower-priority work`,
      triggeredByTaskId: task.id,
      fixedTaskIds: [task.id],
      onlyPriorityBelow: draft.priority,
      onlyEndingAfter: slot.start,
      calendar: cal,
      now,
    });
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/projects");
  return { data: { created: created.length, moved } };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function getProjectTasks(projectId: string) {
  await loadProjectForMember(projectId);

  return db
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      organizationId: tasks.organizationId,
      teamId: tasks.teamId,
      teamName: teams.name,
      title: tasks.title,
      rawInput: tasks.rawInput,
      assigneeId: tasks.assigneeId,
      assigneeFirstName: users.firstName,
      assigneeLastName: users.lastName,
      assigneeEmail: users.email,
      assigneeImage: users.imageUrl,
      estimateHours: tasks.estimateHours,
      priority: tasks.priority,
      status: tasks.status,
      scheduledStart: tasks.scheduledStart,
      scheduledEnd: tasks.scheduledEnd,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .leftJoin(teams, eq(tasks.teamId, teams.id))
    .where(eq(tasks.projectId, projectId))
    .orderBy(asc(tasks.scheduledStart), asc(tasks.priority));
}

export type ProjectTaskRow = Awaited<ReturnType<typeof getProjectTasks>>[number];

export async function getProjectScheduleEvents(projectId: string, limit = 12) {
  await loadProjectForMember(projectId);
  const trigger = alias(tasks, "trigger_task");

  return db
    .select({
      id: scheduleEvents.id,
      taskId: scheduleEvents.taskId,
      taskTitle: tasks.title,
      triggeredByTaskId: scheduleEvents.triggeredByTaskId,
      triggeredByTitle: trigger.title,
      previousStart: scheduleEvents.previousStart,
      previousEnd: scheduleEvents.previousEnd,
      newStart: scheduleEvents.newStart,
      newEnd: scheduleEvents.newEnd,
      reason: scheduleEvents.reason,
      createdAt: scheduleEvents.createdAt,
    })
    .from(scheduleEvents)
    .innerJoin(tasks, eq(scheduleEvents.taskId, tasks.id))
    .leftJoin(trigger, eq(scheduleEvents.triggeredByTaskId, trigger.id))
    .where(eq(scheduleEvents.projectId, projectId))
    .orderBy(desc(scheduleEvents.createdAt))
    .limit(limit);
}

export type ScheduleEventRow = Awaited<
  ReturnType<typeof getProjectScheduleEvents>
>[number];

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

async function loadTaskForMember(taskId: string) {
  const userId = await requireUser();
  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!task) throw new Error("Task not found");
  await requireOrgMember(task.organizationId, userId);
  return { userId, task };
}

export async function updateTaskStatus(taskId: string, status: string) {
  const { task } = await loadTaskForMember(taskId);
  const parsed = taskStatusSchema.safeParse(status);
  if (!parsed.success) return { error: "Invalid status" };
  if (parsed.data === task.status) return { data: { moved: 0 } };

  await db
    .update(tasks)
    .set({ status: parsed.data, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));

  let moved = 0;
  if (parsed.data === "done") {
    // Finished work frees time; later unstarted work may move earlier.
    moved = await replanAssignee(task.organizationId, task.assigneeId, {
      trigger: `"${task.title}" was completed`,
      triggeredByTaskId: task.id,
    });
  }

  revalidatePath(`/dashboard/projects/${task.projectId}`);
  return { data: { moved } };
}

export async function updateTaskPriority(taskId: string, priority: number) {
  const { task } = await loadTaskForMember(taskId);
  const parsed = taskPrioritySchema.safeParse(priority);
  if (!parsed.success) return { error: "Invalid priority" };
  if (parsed.data === task.priority) return { data: { moved: 0 } };

  await db
    .update(tasks)
    .set({ priority: parsed.data, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));

  const moved = await replanAssignee(task.organizationId, task.assigneeId, {
    trigger: `Priority of "${task.title}" changed to P${parsed.data}`,
    triggeredByTaskId: task.id,
  });

  revalidatePath(`/dashboard/projects/${task.projectId}`);
  return { data: { moved } };
}

export async function updateTaskEstimate(taskId: string, estimateHours: number) {
  const { task } = await loadTaskForMember(taskId);
  if (!Number.isFinite(estimateHours) || estimateHours <= 0 || estimateHours > 2000) {
    return { error: "Estimate must be a positive number of hours" };
  }

  await db
    .update(tasks)
    .set({ estimateHours, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));

  const moved = await replanAssignee(task.organizationId, task.assigneeId, {
    trigger: `Estimate of "${task.title}" changed to ${estimateHours}h`,
    triggeredByTaskId: task.id,
  });

  revalidatePath(`/dashboard/projects/${task.projectId}`);
  return { data: { moved } };
}

export async function reassignTask(taskId: string, assigneeId: string) {
  const { task } = await loadTaskForMember(taskId);
  if (assigneeId === task.assigneeId) return { data: { moved: 0 } };

  const [member] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, task.organizationId),
        eq(organizationMembers.userId, assigneeId),
      ),
    )
    .limit(1);
  if (!member) return { error: "That person is not in this organization" };

  await db
    .update(tasks)
    .set({ assigneeId, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));

  const moved = await replanAssignees(
    task.organizationId,
    [task.assigneeId, assigneeId],
    {
      trigger: `"${task.title}" was reassigned`,
      triggeredByTaskId: task.id,
    },
  );

  revalidatePath(`/dashboard/projects/${task.projectId}`);
  return { data: { moved } };
}

export async function deleteTask(taskId: string) {
  const { task } = await loadTaskForMember(taskId);

  await db.delete(tasks).where(eq(tasks.id, taskId));

  const moved = await replanAssignee(task.organizationId, task.assigneeId, {
    trigger: `"${task.title}" was removed`,
  });

  revalidatePath(`/dashboard/projects/${task.projectId}`);
  return { data: { moved } };
}
