"use client";

import { formatInTimeZone } from "date-fns-tz";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ScheduleEventRow } from "@/lib/actions/tasks";

interface ShiftNoticeProps {
  events: ScheduleEventRow[];
  timezone: string;
}

export function ShiftNotice({ events, timezone }: ShiftNoticeProps) {
  if (events.length === 0) return null;

  const fmt = (d: Date) => formatInTimeZone(d, timezone, "EEE d MMM, HH:mm");
  const shifts = events.filter((e) => e.previousStart !== null);
  const latest = shifts[0];

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4" style={{ color: "var(--text-tertiary)" }} />
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-label)",
              color: "var(--text-tertiary)",
              letterSpacing: "0.08em",
            }}
          >
            TIMELINE CHANGES
          </h3>
          {latest && (
            <span className="ml-auto text-xs text-muted-foreground">
              last change {formatDistanceToNow(latest.createdAt, { addSuffix: true })}
            </span>
          )}
        </div>

        <ul className="space-y-2">
          {events.slice(0, 8).map((e) => {
            const moved = e.previousStart !== null;
            return (
              <li key={e.id} className="text-xs leading-relaxed">
                <span className="font-medium">{e.taskTitle}</span>{" "}
                {moved ? (
                  <>
                    <span className="text-muted-foreground">
                      moved {e.previousStart && fmt(e.previousStart)}
                    </span>
                    <ArrowRight className="mx-1 inline h-3 w-3 text-muted-foreground" />
                    <span>{fmt(e.newStart)}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">scheduled {fmt(e.newStart)}</span>
                )}
                <span className="text-muted-foreground"> — {e.reason}</span>
                {e.triggeredByTitle && e.triggeredByTaskId !== e.taskId && (
                  <span className="text-muted-foreground"> (because of &ldquo;{e.triggeredByTitle}&rdquo;)</span>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
