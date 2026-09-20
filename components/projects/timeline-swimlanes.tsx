"use client";

import { useMemo } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { ProjectTaskRow } from "@/lib/actions/tasks";
import type { SerializedCalendar } from "@/lib/scheduling/org-calendar";
import { deserializeCalendar } from "@/lib/scheduling/org-calendar";
import { barGeometry, buildDayColumns } from "@/lib/scheduling/timeline-geometry";
import { PRIORITY_COLORS, initials, memberName } from "./priority";

interface TimelineSwimlanesProps {
  tasks: ProjectTaskRow[];
  calendar: SerializedCalendar;
  projectStart: Date;
}

const DAY_WIDTH = 96; // px per day column

export function TimelineSwimlanes({ tasks, calendar, projectStart }: TimelineSwimlanesProps) {
  const cal = useMemo(() => deserializeCalendar(calendar), [calendar]);

  const { columns, lanes } = useMemo(() => {
    const now = new Date();
    const starts = tasks.map((t) => t.scheduledStart.getTime());
    const ends = tasks.map((t) => t.scheduledEnd.getTime());
    const rangeStart = new Date(
      Math.min(projectStart.getTime(), now.getTime(), ...(starts.length ? starts : [now.getTime()])),
    );
    const rangeEndBase = new Date(
      Math.max(now.getTime(), ...(ends.length ? ends : [now.getTime()])),
    );
    // Always show at least 10 days and one day of slack after the last task.
    const minEnd = new Date(rangeStart.getTime() + 9 * 24 * 60 * 60 * 1000);
    const rangeEnd = new Date(
      Math.max(rangeEndBase.getTime() + 24 * 60 * 60 * 1000, minEnd.getTime()),
    );

    const columns = buildDayColumns(rangeStart, rangeEnd, cal, now);

    const byAssignee = new Map<string, { name: string; image: string | null; tasks: ProjectTaskRow[] }>();
    for (const t of tasks) {
      if (!byAssignee.has(t.assigneeId)) {
        byAssignee.set(t.assigneeId, {
          name: memberName(t.assigneeFirstName, t.assigneeLastName, t.assigneeEmail),
          image: t.assigneeImage,
          tasks: [],
        });
      }
      byAssignee.get(t.assigneeId)!.tasks.push(t);
    }
    const lanes = [...byAssignee.entries()]
      .map(([id, lane]) => ({ id, ...lane }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { columns, lanes };
  }, [tasks, cal, projectStart]);

  if (tasks.length === 0) return null;

  const stripWidth = columns.length * DAY_WIDTH;
  const fmt = (d: Date) => formatInTimeZone(d, cal.timezone, "EEE d MMM HH:mm");

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex">
          {/* Lane labels */}
          <div className="w-44 flex-shrink-0 border-r">
            <div className="h-10 border-b px-3 py-2 text-xs text-muted-foreground">
              {lanes.length} {lanes.length === 1 ? "person" : "people"}
            </div>
            {lanes.map((lane) => (
              <div key={lane.id} className="flex h-14 items-center gap-2 border-b px-3 last:border-b-0">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={lane.image ?? undefined} />
                  <AvatarFallback className="text-[10px]">{initials(lane.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{lane.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {lane.tasks.filter((t) => t.status !== "done").length} open
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Scrollable strip */}
          <div className="flex-1 overflow-x-auto">
            <div style={{ width: stripWidth, minWidth: "100%" }}>
              {/* Day header */}
              <div className="flex h-10 border-b">
                {columns.map((c) => (
                  <div
                    key={c.key}
                    className="flex-shrink-0 border-r px-2 py-2 text-[11px] last:border-r-0"
                    style={{
                      width: DAY_WIDTH,
                      background: c.working ? "transparent" : "var(--surface-2)",
                      color: c.isToday ? "var(--text-primary)" : "var(--text-tertiary)",
                      fontWeight: c.isToday ? 600 : 400,
                    }}
                    title={c.working ? c.key : `${c.key} — not a working day`}
                  >
                    {c.label}
                    {!c.working && <span className="ml-1 opacity-60">off</span>}
                  </div>
                ))}
              </div>

              {/* Lanes */}
              {lanes.map((lane) => (
                <div key={lane.id} className="relative h-14 border-b last:border-b-0">
                  {/* Column backgrounds */}
                  <div className="absolute inset-0 flex">
                    {columns.map((c) => (
                      <div
                        key={c.key}
                        className="h-full flex-shrink-0 border-r last:border-r-0"
                        style={{
                          width: DAY_WIDTH,
                          background: c.working
                            ? c.isToday
                              ? "var(--green-surface)"
                              : "transparent"
                            : "var(--surface-2)",
                        }}
                      />
                    ))}
                  </div>

                  {/* Bars */}
                  {lane.tasks.map((t) => {
                    const geo = barGeometry(t.scheduledStart, t.scheduledEnd, columns, cal);
                    if (!geo) return null;
                    const color = PRIORITY_COLORS[t.priority];
                    const done = t.status === "done";
                    return (
                      <div
                        key={t.id}
                        className="absolute top-3 h-8 overflow-hidden rounded-md border px-2 text-[11px] leading-8 whitespace-nowrap"
                        style={{
                          left: `${geo.left}%`,
                          width: `${geo.width}%`,
                          background: done ? "var(--surface-3)" : "var(--surface)",
                          borderColor: color,
                          borderLeftWidth: 3,
                          color: done ? "var(--text-tertiary)" : "var(--text-primary)",
                          textDecoration: done ? "line-through" : "none",
                          opacity: t.status === "in_progress" ? 1 : 0.95,
                        }}
                        title={`${t.title}\nP${t.priority} · ${t.estimateHours}h\n${fmt(t.scheduledStart)} → ${fmt(t.scheduledEnd)}`}
                      >
                        {t.title}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
