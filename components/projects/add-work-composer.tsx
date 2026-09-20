"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { Sparkles, AlertTriangle, Check, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { previewWork, commitWork, type WorkDraft } from "@/lib/actions/tasks";
import type { SerializedCalendar } from "@/lib/scheduling/org-calendar";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "./priority";

interface AddWorkComposerProps {
  projectId: string;
  organizationId: string;
  members: { userId: string; name: string }[];
  teams: { id: string; name: string }[];
  calendar: SerializedCalendar;
  hoursPerDay: number;
}

type EditableDraft = WorkDraft & {
  assigneeId: string | null;
};

export function AddWorkComposer({
  projectId,
  members,
  teams,
  calendar,
  hoursPerDay,
}: AddWorkComposerProps) {
  const [input, setInput] = useState("");
  const [drafts, setDrafts] = useState<EditableDraft[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();

  const fmt = (iso: string) =>
    formatInTimeZone(new Date(iso), calendar.timezone, "EEE d MMM, HH:mm");

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const result = await previewWork(projectId, input);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("data" in result && result.data) {
        setDrafts(
          result.data.drafts.map((d) => ({
            ...d,
            assigneeId: d.assignee.kind === "matched" ? d.assignee.userId : null,
          })),
        );
      }
    } catch {
      setError("Something went wrong while reading that. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateDraft = (key: string, patch: Partial<EditableDraft>) => {
    setDrafts((prev) =>
      prev ? prev.map((d) => (d.key === key ? { ...d, ...patch } : d)) : prev,
    );
  };

  const removeDraft = (key: string) => {
    setDrafts((prev) => (prev ? prev.filter((d) => d.key !== key) : prev));
  };

  const unresolved = drafts?.filter((d) => !d.assigneeId).length ?? 0;

  const handleCommit = async () => {
    if (!drafts || drafts.length === 0) return;
    setCommitting(true);
    setError(null);
    try {
      const result = await commitWork(
        projectId,
        drafts.map((d) => ({
          title: d.title,
          assigneeId: d.assigneeId ?? "",
          teamId: d.teamId,
          estimateHours: d.estimateHours,
          priority: d.priority,
          scheduledStart: d.scheduledStart,
          reason: d.reason,
          rawInput: input.slice(0, 2000),
        })),
      );
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("data" in result && result.data) {
        const { created, moved } = result.data;
        setNotice(
          `${created} task${created === 1 ? "" : "s"} scheduled${
            moved > 0
              ? `, ${moved} existing task${moved === 1 ? "" : "s"} re-dated by AI`
              : ""
          }.`,
        );
      }
      setDrafts(null);
      setInput("");
      router.refresh();
    } catch {
      setError("Could not save those tasks. Please try again.");
    } finally {
      setCommitting(false);
    }
  };

  return (
    <Card className="border-2">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h3)",
              color: "var(--text-primary)",
              fontWeight: 400,
            }}
          >
            ADD WORK
          </h3>
          <span className="text-xs text-muted-foreground">
            Working hours {calendar.workStart.slice(0, 5)}–
            {calendar.workEnd.slice(0, 5)} · {hoursPerDay}h = 1 day
          </span>
        </div>

        {!drafts && (
          <>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                members.length
                  ? `e.g. "${members[0]?.name.split(" ")[0] ?? "Sam"}, high priority, fix the login bug, 1 day. ${
                      members[1]?.name.split(" ")[0] ?? "Priya"
                    }${teams[0] ? ` on ${teams[0].name}` : ""} to review the API, half day."`
                  : "Describe the work and who should do it..."
              }
              className="min-h-[90px] resize-none"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handlePreview();
              }}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Name people as they appear in your workspace. ⌘ + Enter to plan.
              </p>
              <Button onClick={handlePreview} disabled={loading || input.trim().length < 3}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {loading ? "Planning..." : "Plan with AI"}
              </Button>
            </div>
          </>
        )}

        {drafts && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Review before saving. Fix anything the AI got wrong; unresolved
              names must be picked.
            </p>

            {drafts.map((d) => (
              <div
                key={d.key}
                className="rounded-lg border p-3"
                style={{
                  background: "var(--surface)",
                  borderColor:
                    d.assigneeId ? "var(--border)" : "var(--amber)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <Input
                    value={d.title}
                    onChange={(e) => updateDraft(d.key, { title: e.target.value })}
                    className="h-9 font-medium"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDraft(d.key)}
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                  {/* Assignee */}
                  <label className="space-y-1 text-xs text-muted-foreground sm:col-span-2">
                    <span className="flex items-center gap-1">
                      Assignee
                      {d.assignee.kind === "ambiguous" && !d.assigneeId && (
                        <span className="flex items-center gap-1" style={{ color: "var(--amber)" }}>
                          <AlertTriangle className="h-3 w-3" />
                          &ldquo;{d.assignee.rawName}&rdquo; matches several people
                        </span>
                      )}
                      {d.assignee.kind === "unmatched" && !d.assigneeId && (
                        <span className="flex items-center gap-1" style={{ color: "var(--amber)" }}>
                          <AlertTriangle className="h-3 w-3" />
                          {d.assignee.rawName
                            ? `no one called "${d.assignee.rawName}"`
                            : "no one named"}
                        </span>
                      )}
                    </span>
                    <select
                      value={d.assigneeId ?? ""}
                      onChange={(e) =>
                        updateDraft(d.key, { assigneeId: e.target.value || null })
                      }
                      className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                    >
                      <option value="">Pick a person…</option>
                      {(d.assignee.kind === "ambiguous"
                        ? [
                            ...d.assignee.candidates,
                            ...members.filter(
                              (m) =>
                                d.assignee.kind === "ambiguous" &&
                                !d.assignee.candidates.some((c) => c.userId === m.userId),
                            ),
                          ]
                        : members
                      ).map((m) => (
                        <option key={m.userId} value={m.userId}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Priority */}
                  <label className="space-y-1 text-xs text-muted-foreground">
                    <span>Priority</span>
                    <select
                      value={d.priority}
                      onChange={(e) =>
                        updateDraft(d.key, { priority: Number(e.target.value) })
                      }
                      className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                    >
                      {[1, 2, 3, 4].map((p) => (
                        <option key={p} value={p}>
                          P{p} · {PRIORITY_LABELS[p]}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Estimate */}
                  <label className="space-y-1 text-xs text-muted-foreground">
                    <span>Estimate (hours)</span>
                    <Input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={d.estimateHours}
                      onChange={(e) =>
                        updateDraft(d.key, {
                          estimateHours: Math.max(0.5, Number(e.target.value) || 0.5),
                        })
                      }
                      className="h-9"
                    />
                  </label>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <label className="flex items-center gap-1 text-muted-foreground">
                    Team
                    <select
                      value={d.teamId ?? ""}
                      onChange={(e) => {
                        const id = e.target.value || null;
                        updateDraft(d.key, {
                          teamId: id,
                          teamName: teams.find((t) => t.id === id)?.name ?? null,
                        });
                      }}
                      className="h-7 rounded-md border bg-background px-2 text-xs"
                    >
                      <option value="">Whole workspace</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: PRIORITY_COLORS[d.priority], color: PRIORITY_COLORS[d.priority] }}
                  >
                    P{d.priority}
                  </Badge>

                  {d.preview ? (
                    <span className="text-muted-foreground">
                      {fmt(d.preview.start)} → {fmt(d.preview.end)}
                    </span>
                  ) : d.assigneeId ? (
                    <span className="text-muted-foreground">
                      Will be placed in {members.find((m) => m.userId === d.assigneeId)?.name}&apos;s queue on save
                    </span>
                  ) : null}

                  {d.reason && (
                    <span className="text-muted-foreground italic">— {d.reason}</span>
                  )}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-1">
              <Button variant="outline" onClick={() => setDrafts(null)} disabled={committing}>
                Back
              </Button>
              <div className="flex items-center gap-3">
                {unresolved > 0 && (
                  <span className="text-xs" style={{ color: "var(--amber)" }}>
                    {unresolved} task{unresolved === 1 ? "" : "s"} still need an assignee
                  </span>
                )}
                <Button
                  onClick={handleCommit}
                  disabled={committing || unresolved > 0 || drafts.length === 0}
                >
                  {committing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {committing ? "Scheduling..." : `Schedule ${drafts.length} task${drafts.length === 1 ? "" : "s"}`}
                </Button>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        {notice && <p className="text-sm" style={{ color: "var(--green)" }}>{notice}</p>}
      </CardContent>
    </Card>
  );
}
