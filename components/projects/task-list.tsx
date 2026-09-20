"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteTask,
  reassignTask,
  updateTaskPriority,
  updateTaskStatus,
  type ProjectTaskRow,
} from "@/lib/actions/tasks";
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  formatHours,
  initials,
  memberName,
} from "./priority";

interface TaskListProps {
  tasks: ProjectTaskRow[];
  members: { userId: string; name: string }[];
  timezone: string;
  hoursPerDay: number;
  onChanged?: (message: string) => void;
}

export function TaskList({ tasks, members, timezone, hoursPerDay, onChanged }: TaskListProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();

  const fmt = (d: Date) => formatInTimeZone(d, timezone, "EEE d MMM, HH:mm");

  const run = async (
    id: string,
    fn: () => Promise<{ error?: string; data?: { moved: number } }>,
    label: string,
  ) => {
    setBusy(id);
    try {
      const res = await fn();
      if (res.error) {
        onChanged?.(res.error);
      } else {
        const moved = res.data?.moved ?? 0;
        onChanged?.(
          moved > 0
            ? `${label}. AI re-dated ${moved} other task${moved === 1 ? "" : "s"}.`
            : label,
        );
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">No tasks yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Describe the work above — AI will split it into tasks, assign people
            and place them on the timeline.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((t) => {
        const name = memberName(t.assigneeFirstName, t.assigneeLastName, t.assigneeEmail);
        const isDone = t.status === "done";
        return (
          <Card key={t.id} className={isDone ? "opacity-60" : undefined}>
            <CardContent className="flex flex-wrap items-center gap-3 py-3">
              <div
                className="h-8 w-1 flex-shrink-0 rounded-full"
                style={{ background: PRIORITY_COLORS[t.priority] }}
                title={`P${t.priority} ${PRIORITY_LABELS[t.priority]}`}
              />

              <div className="min-w-[200px] flex-1">
                <p className={`text-sm font-medium ${isDone ? "line-through" : ""}`}>
                  {t.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fmt(t.scheduledStart)} → {fmt(t.scheduledEnd)} ·{" "}
                  {formatHours(t.estimateHours, hoursPerDay)}
                  {t.teamName ? ` · ${t.teamName}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={t.assigneeImage ?? undefined} />
                  <AvatarFallback className="text-[10px]">{initials(name)}</AvatarFallback>
                </Avatar>
                <select
                  value={t.assigneeId}
                  disabled={busy === t.id || isDone}
                  onChange={(e) =>
                    run(t.id, () => reassignTask(t.id, e.target.value), "Reassigned")
                  }
                  className="h-8 max-w-[150px] rounded-md border bg-background px-2 text-xs"
                  title="Assignee"
                >
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={t.priority}
                disabled={busy === t.id || isDone}
                onChange={(e) =>
                  run(
                    t.id,
                    () => updateTaskPriority(t.id, Number(e.target.value)),
                    "Priority updated",
                  )
                }
                className="h-8 rounded-md border bg-background px-2 text-xs"
                style={{ color: PRIORITY_COLORS[t.priority] }}
                title="Priority"
              >
                {[1, 2, 3, 4].map((p) => (
                  <option key={p} value={p}>
                    P{p} {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>

              <select
                value={t.status}
                disabled={busy === t.id}
                onChange={(e) =>
                  run(t.id, () => updateTaskStatus(t.id, e.target.value), "Status updated")
                }
                className="h-8 rounded-md border bg-background px-2 text-xs"
                title="Status"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <Badge
                variant={t.status === "in_progress" ? "default" : "secondary"}
                className="hidden text-xs sm:inline-flex"
              >
                {STATUS_LABELS[t.status] ?? t.status}
              </Badge>

              <Button
                variant="ghost"
                size="icon"
                disabled={busy === t.id}
                onClick={() => {
                  if (confirm(`Remove "${t.title}"?`)) {
                    run(t.id, () => deleteTask(t.id), "Task removed");
                  }
                }}
                className="text-destructive hover:text-destructive"
                title="Remove task"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
