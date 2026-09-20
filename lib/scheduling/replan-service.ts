import { db } from "@/lib/db";
import { scheduleEvents, tasks, users } from "@/lib/db/schema";
import { and, eq, inArray, ne } from "drizzle-orm";
import { getOrgCalendar } from "./org-calendar";
import {
  replanAssigneeTimeline,
  type ReplanTask,
} from "@/lib/ai/replan-timeline";
import type { WorkCalendar } from "./calendar";

export type ReplanOptions = {
  /** Text shown to the model and stored on schedule events. */
  trigger: string;
  /** The task that caused the re-plan (logged on schedule events). */
  triggeredByTaskId?: string;
  /** Todo tasks that must keep their dates during this re-plan. */
  fixedTaskIds?: string[];
  /** Only re-date todo tasks with priority strictly greater (i.e. lower) than this. */
  onlyPriorityBelow?: number;
  /** Only re-date todo tasks whose window ends after this instant. */
  onlyEndingAfter?: Date;
  /** Pre-loaded calendar to avoid a second fetch. */
  calendar?: WorkCalendar;
  now?: Date;
};

const ONE_MINUTE = 60 * 1000;

function toReplanTask(t: typeof tasks.$inferSelect): ReplanTask {
  return {
    id: t.id,
    title: t.title,
    priority: t.priority,
    estimateHours: t.estimateHours,
    createdAt: t.createdAt,
    scheduledStart: t.scheduledStart,
    scheduledEnd: t.scheduledEnd,
  };
}

/**
 * Re-plan one person's unstarted work inside an organization.
 * Returns the number of tasks whose dates actually changed.
 */
export async function replanAssignee(
  organizationId: string,
  assigneeId: string,
  opts: ReplanOptions,
): Promise<number> {
  const now = opts.now ?? new Date();
  const calendar = opts.calendar ?? (await getOrgCalendar(organizationId));

  const open = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.organizationId, organizationId),
        eq(tasks.assigneeId, assigneeId),
        ne(tasks.status, "done"),
      ),
    );

  if (open.length === 0) return 0;

  const fixed: ReplanTask[] = [];
  const movable: ReplanTask[] = [];

  const fixedIds = new Set(opts.fixedTaskIds ?? []);

  for (const t of open) {
    const isMovable =
      t.status === "todo" &&
      !fixedIds.has(t.id) &&
      (opts.onlyPriorityBelow === undefined ||
        t.priority > opts.onlyPriorityBelow) &&
      (opts.onlyEndingAfter === undefined ||
        t.scheduledEnd > opts.onlyEndingAfter);
    (isMovable ? movable : fixed).push(toReplanTask(t));
  }

  if (movable.length === 0) return 0;

  const [assignee] = await db
    .select({ firstName: users.firstName, lastName: users.lastName })
    .from(users)
    .where(eq(users.id, assigneeId))
    .limit(1);
  const assigneeName =
    `${assignee?.firstName ?? ""} ${assignee?.lastName ?? ""}`.trim() ||
    "this member";

  const result = await replanAssigneeTimeline({
    assigneeName,
    calendar,
    now,
    fixed,
    movable,
    trigger: opts.trigger,
  });

  const byId = new Map(open.map((t) => [t.id, t]));
  let moved = 0;

  for (const [taskId, placement] of result.placements) {
    const current = byId.get(taskId);
    if (!current) continue;
    const startDelta = Math.abs(
      placement.start.getTime() - current.scheduledStart.getTime(),
    );
    const endDelta = Math.abs(
      placement.end.getTime() - current.scheduledEnd.getTime(),
    );
    if (startDelta < ONE_MINUTE && endDelta < ONE_MINUTE) continue;

    await db
      .update(tasks)
      .set({
        scheduledStart: placement.start,
        scheduledEnd: placement.end,
        updatedAt: now,
      })
      .where(eq(tasks.id, taskId));

    await db.insert(scheduleEvents).values({
      organizationId,
      projectId: current.projectId,
      taskId,
      triggeredByTaskId: opts.triggeredByTaskId ?? null,
      previousStart: current.scheduledStart,
      previousEnd: current.scheduledEnd,
      newStart: placement.start,
      newEnd: placement.end,
      reason: placement.reason || opts.trigger,
    });
    moved++;
  }

  return moved;
}

/** Re-plan every member in the org who has unstarted work. */
export async function replanOrganization(
  organizationId: string,
  trigger: string,
): Promise<number> {
  const calendar = await getOrgCalendar(organizationId);
  const rows = await db
    .selectDistinct({ assigneeId: tasks.assigneeId })
    .from(tasks)
    .where(
      and(eq(tasks.organizationId, organizationId), eq(tasks.status, "todo")),
    );

  let total = 0;
  for (const { assigneeId } of rows) {
    total += await replanAssignee(organizationId, assigneeId, {
      trigger,
      calendar,
    });
  }
  return total;
}

/** Re-plan a specific set of people (e.g. old + new assignee). */
export async function replanAssignees(
  organizationId: string,
  assigneeIds: string[],
  opts: ReplanOptions,
): Promise<number> {
  const unique = [...new Set(assigneeIds)];
  if (unique.length === 0) return 0;
  const calendar = opts.calendar ?? (await getOrgCalendar(organizationId));
  let total = 0;
  for (const id of unique) {
    total += await replanAssignee(organizationId, id, { ...opts, calendar });
  }
  return total;
}

export async function loadOpenTasksFor(
  organizationId: string,
  assigneeIds: string[],
) {
  if (assigneeIds.length === 0) return [];
  return db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.organizationId, organizationId),
        inArray(tasks.assigneeId, assigneeIds),
        ne(tasks.status, "done"),
      ),
    );
}
