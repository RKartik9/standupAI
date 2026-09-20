"use client";

import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarRange, CheckCircle2, FolderKanban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  startDate: Date;
  status: string;
  taskCount: number;
  doneCount: number;
  firstStart: Date | null;
  lastEnd: Date | null;
};

interface ProjectListProps {
  projects: ProjectSummary[];
  organizationId: string;
  timezone: string;
}

export function ProjectList({ projects, organizationId, timezone }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">No projects yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Create a project, then describe the work in plain language. AI will
            assign it to your people and lay out the timeline.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {projects.map((p) => {
        const pct =
          p.taskCount > 0 ? Math.round((p.doneCount / p.taskCount) * 100) : 0;
        const fmt = (d: Date) => formatInTimeZone(d, timezone, "d MMM");
        return (
          <Link
            key={p.id}
            href={`/dashboard/projects/${p.id}?orgId=${organizationId}`}
            style={{ textDecoration: "none" }}
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FolderKanban
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: "var(--text-tertiary)" }}
                    />
                    <p className="font-medium">{p.name}</p>
                  </div>
                  {p.status === "archived" && (
                    <Badge variant="secondary" className="text-xs">
                      archived
                    </Badge>
                  )}
                </div>

                {p.description && (
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                )}

                <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--surface-3)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: "var(--green)" }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {p.doneCount}/{p.taskCount} tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarRange className="h-3.5 w-3.5" />
                    {p.firstStart && p.lastEnd
                      ? `${fmt(p.firstStart)} → ${fmt(p.lastEnd)}`
                      : `starts ${fmt(p.startDate)}`}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
