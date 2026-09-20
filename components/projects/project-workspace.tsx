"use client";

import { useMemo, useState } from "react";
import type { ProjectTaskRow, ScheduleEventRow } from "@/lib/actions/tasks";
import type { SerializedCalendar } from "@/lib/scheduling/org-calendar";
import { hoursPerDay } from "@/lib/scheduling/calendar";
import { AddWorkComposer } from "./add-work-composer";
import { TaskList } from "./task-list";
import { TimelineSwimlanes } from "./timeline-swimlanes";
import { ShiftNotice } from "./shift-notice";
import { cn } from "@/lib/utils";

interface ProjectWorkspaceProps {
  projectId: string;
  organizationId: string;
  projectStart: Date;
  tasks: ProjectTaskRow[];
  events: ScheduleEventRow[];
  members: { userId: string; name: string }[];
  teams: { id: string; name: string }[];
  calendar: SerializedCalendar;
}

export function ProjectWorkspace({
  projectId,
  organizationId,
  projectStart,
  tasks,
  events,
  members,
  teams,
  calendar,
}: ProjectWorkspaceProps) {
  const [teamFilter, setTeamFilter] = useState<string | "all">("all");
  const [toast, setToast] = useState<string | null>(null);

  const hpd = useMemo(
    () => hoursPerDay({ ...calendar, holidays: new Set(calendar.holidays) }),
    [calendar],
  );

  const visible = useMemo(
    () => (teamFilter === "all" ? tasks : tasks.filter((t) => t.teamId === teamFilter)),
    [tasks, teamFilter],
  );

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  const openCount = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="space-y-8">
      <AddWorkComposer
        projectId={projectId}
        organizationId={organizationId}
        members={members}
        teams={teams}
        calendar={calendar}
        hoursPerDay={hpd}
      />

      {/* Filter chips */}
      {teams.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Chip active={teamFilter === "all"} onClick={() => setTeamFilter("all")}>
            All
          </Chip>
          {teams.map((t) => (
            <Chip
              key={t.id}
              active={teamFilter === t.id}
              onClick={() => setTeamFilter(t.id)}
            >
              {t.name}
            </Chip>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            {visible.length} of {tasks.length} tasks · {openCount} open
          </span>
        </div>
      )}

      {/* Timeline */}
      <section className="space-y-3">
        <SectionHeading title="TIMELINE" subtitle="One row per person, inside your working hours" />
        {visible.length > 0 ? (
          <TimelineSwimlanes tasks={visible} calendar={calendar} projectStart={projectStart} />
        ) : (
          <p className="text-sm text-muted-foreground">Nothing scheduled for this filter yet.</p>
        )}
      </section>

      <ShiftNotice events={events} timezone={calendar.timezone} />

      {/* Task list */}
      <section className="space-y-3">
        <SectionHeading
          title="TASKS"
          subtitle="Change priority, assignee or status — AI re-dates unstarted work"
        />
        <TaskList
          tasks={visible}
          members={members}
          timezone={calendar.timezone}
          hoursPerDay={hpd}
          onChanged={showToast}
        />
      </section>

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-lg border px-4 py-3 text-sm shadow-lg"
          style={{ background: "var(--surface)", color: "var(--text-primary)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active ? "border-transparent" : "hover:bg-[var(--surface-2)]",
      )}
      style={{
        fontFamily: "var(--font-body)",
        background: active ? "var(--accent)" : "var(--surface)",
        color: active ? "#fff" : "var(--text-secondary)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-h3)",
          color: "var(--text-primary)",
          fontWeight: 400,
          letterSpacing: "0.02em",
        }}
      >
        {title}
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}
