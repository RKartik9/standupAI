"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  addHoliday,
  removeHoliday,
  updateOrgCalendar,
} from "@/lib/actions/organizations";
import type { SerializedCalendar } from "@/lib/scheduling/org-calendar";
import { cn } from "@/lib/utils";

export type HolidayRow = { id: string; date: string; label: string };

interface WorkingCalendarSettingsProps {
  organizationId: string;
  calendar: SerializedCalendar;
  holidays: HolidayRow[];
  isAdmin: boolean;
}

const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

const FALLBACK_TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Africa/Johannesburg",
  "UTC",
];

function hm(value: string) {
  return value.slice(0, 5);
}

function hoursBetween(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.round(((eh * 60 + em - (sh * 60 + sm)) / 60) * 100) / 100;
}

export function WorkingCalendarSettings({
  organizationId,
  calendar,
  holidays,
  isAdmin,
}: WorkingCalendarSettingsProps) {
  const [workingDays, setWorkingDays] = useState<number[]>(calendar.workingDays);
  const [workStart, setWorkStart] = useState(hm(calendar.workStart));
  const [workEnd, setWorkEnd] = useState(hm(calendar.workEnd));
  const [timezone, setTimezone] = useState(calendar.timezone);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [holidayDate, setHolidayDate] = useState("");
  const [holidayLabel, setHolidayLabel] = useState("");
  const [holidayBusy, setHolidayBusy] = useState<string | null>(null);
  const router = useRouter();

  const timezones = useMemo(() => {
    try {
      const supported = (
        Intl as unknown as { supportedValuesOf?: (key: string) => string[] }
      ).supportedValuesOf?.("timeZone");
      const list = supported && supported.length ? supported : FALLBACK_TIMEZONES;
      return list.includes(timezone) ? list : [timezone, ...list];
    } catch {
      return FALLBACK_TIMEZONES.includes(timezone)
        ? FALLBACK_TIMEZONES
        : [timezone, ...FALLBACK_TIMEZONES];
    }
  }, [timezone]);

  const dirty =
    workingDays.slice().sort().join(",") !== calendar.workingDays.slice().sort().join(",") ||
    workStart !== hm(calendar.workStart) ||
    workEnd !== hm(calendar.workEnd) ||
    timezone !== calendar.timezone;

  const dayLength = hoursBetween(workStart, workEnd);

  const toggleDay = (d: number) => {
    setWorkingDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );
  };

  const flash = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await updateOrgCalendar(organizationId, {
        workingDays,
        workStart,
        workEnd,
        timezone,
      });
      if (res.error) {
        const first = Object.values(res.error).flat()[0];
        setError(typeof first === "string" ? first : "Could not save the calendar");
        return;
      }
      const moved = res.data?.moved ?? 0;
      flash(
        moved > 0
          ? `Calendar saved. Timeline updated for ${moved} task${moved === 1 ? "" : "s"}.`
          : "Calendar saved. No unstarted tasks needed to move.",
      );
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!holidayDate || !holidayLabel.trim()) return;
    setHolidayBusy("new");
    setError(null);
    try {
      const res = await addHoliday(organizationId, {
        date: holidayDate,
        label: holidayLabel.trim(),
      });
      if (res.error) {
        const first = Object.values(res.error).flat()[0];
        setError(typeof first === "string" ? first : "Could not add holiday");
        return;
      }
      setHolidayDate("");
      setHolidayLabel("");
      const moved = res.data?.moved ?? 0;
      flash(
        moved > 0
          ? `Holiday added. Timeline updated for ${moved} task${moved === 1 ? "" : "s"}.`
          : "Holiday added.",
      );
      router.refresh();
    } finally {
      setHolidayBusy(null);
    }
  };

  const handleRemoveHoliday = async (id: string) => {
    setHolidayBusy(id);
    setError(null);
    try {
      const res = await removeHoliday(organizationId, id);
      const moved = res.data?.moved ?? 0;
      flash(
        moved > 0
          ? `Holiday removed. Timeline updated for ${moved} task${moved === 1 ? "" : "s"}.`
          : "Holiday removed.",
      );
      router.refresh();
    } finally {
      setHolidayBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4" />
          Working Calendar
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          AI schedules every task inside these rules. Changing them re-plans all
          unstarted work; in-progress and done tasks keep their dates.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Working days */}
        <div className="space-y-2">
          <Label>Working days</Label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => {
              const on = workingDays.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => toggleDay(d.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    on ? "border-transparent" : "hover:bg-[var(--surface-2)]",
                    !isAdmin && "cursor-default",
                  )}
                  style={{
                    fontFamily: "var(--font-body)",
                    background: on ? "var(--accent)" : "var(--surface)",
                    color: on ? "#fff" : "var(--text-secondary)",
                    cursor: isAdmin ? "pointer" : "default",
                  }}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          {workingDays.length === 0 && (
            <p className="text-xs text-destructive">Pick at least one working day.</p>
          )}
        </div>

        {/* Hours + timezone */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="work-start">Day starts</Label>
            <Input
              id="work-start"
              type="time"
              value={workStart}
              disabled={!isAdmin}
              onChange={(e) => setWorkStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="work-end">Day ends</Label>
            <Input
              id="work-end"
              type="time"
              value={workEnd}
              disabled={!isAdmin}
              onChange={(e) => setWorkEnd(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              value={timezone}
              disabled={!isAdmin}
              onChange={(e) => setTimezone(e.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {dayLength > 0
            ? `One working day = ${dayLength} hours. "1 day" in a task means ${dayLength}h; "half day" means ${dayLength / 2}h.`
            : "End time must be after start time."}
        </p>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || !dirty || workingDays.length === 0 || dayLength <= 0}
            >
              {saving ? "Saving & re-planning..." : "Save calendar"}
            </Button>
            {message && <p className="text-sm" style={{ color: "var(--green)" }}>{message}</p>}
          </div>
        )}

        <Separator />

        {/* Holidays */}
        <div className="space-y-3">
          <div>
            <Label>Holidays & shutdowns</Label>
            <p className="text-xs text-muted-foreground">
              Days nobody works — public holidays, company offsites, year-end closure.
            </p>
          </div>

          {holidays.length === 0 ? (
            <p className="text-sm text-muted-foreground">No holidays added.</p>
          ) : (
            <ul className="space-y-1.5">
              {holidays.map((h) => (
                <li
                  key={h.id}
                  className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
                  style={{ background: "var(--surface)" }}
                >
                  <span>
                    <span className="font-medium">{h.date}</span>
                    <span className="ml-2 text-muted-foreground">{h.label}</span>
                  </span>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveHoliday(h.id)}
                      disabled={holidayBusy === h.id}
                      title="Remove holiday"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {isAdmin && (
            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="holiday-date" className="text-xs">Date</Label>
                <Input
                  id="holiday-date"
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="h-9 w-[160px]"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor="holiday-label" className="text-xs">Label</Label>
                <Input
                  id="holiday-label"
                  placeholder="e.g. Diwali, Christmas, Company offsite"
                  value={holidayLabel}
                  onChange={(e) => setHolidayLabel(e.target.value)}
                  className="h-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddHoliday();
                  }}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleAddHoliday}
                disabled={holidayBusy === "new" || !holidayDate || !holidayLabel.trim()}
                className="h-9"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
