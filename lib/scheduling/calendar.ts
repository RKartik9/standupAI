import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz";

/**
 * Pure working-calendar helpers. Every function is parameterised by the
 * organization's own rules — nothing about days or hours is hardcoded here.
 *
 * Convention: all `Date` inputs/outputs are real instants (UTC under the hood).
 * Internally we convert to the org's wall clock with `toZonedTime`, do the
 * arithmetic, and convert back with `fromZonedTime`.
 */

export type WorkCalendar = {
  /** Weekdays that are working days. 0 = Sunday ... 6 = Saturday. */
  workingDays: number[];
  /** "HH:mm" (postgres `time` values like "10:00:00" are accepted too). */
  workStart: string;
  workEnd: string;
  /** IANA timezone, e.g. "Asia/Kolkata". */
  timezone: string;
  /** "YYYY-MM-DD" dates (in the org timezone) that are days off. */
  holidays: Set<string>;
};

export type TimeRange = { start: Date; end: Date };

export const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5, 6];
export const DEFAULT_WORK_START = "10:00";
export const DEFAULT_WORK_END = "18:00";
export const DEFAULT_TIMEZONE = "Asia/Kolkata";

export const DEFAULT_CALENDAR: WorkCalendar = {
  workingDays: DEFAULT_WORKING_DAYS,
  workStart: DEFAULT_WORK_START,
  workEnd: DEFAULT_WORK_END,
  timezone: DEFAULT_TIMEZONE,
  holidays: new Set(),
};

const MS_PER_HOUR = 60 * 60 * 1000;
const MAX_DAY_SCAN = 366 * 3;

// ---------------------------------------------------------------------------
// Basics
// ---------------------------------------------------------------------------

export function parseHM(value: string): { h: number; m: number } {
  const [h = "0", m = "0"] = value.split(":");
  return { h: Number(h) || 0, m: Number(m) || 0 };
}

/** Length of one working day in hours, e.g. 10:00–18:00 = 8. */
export function hoursPerDay(cal: WorkCalendar): number {
  const s = parseHM(cal.workStart);
  const e = parseHM(cal.workEnd);
  const hours = e.h + e.m / 60 - (s.h + s.m / 60);
  return hours > 0 ? Math.round(hours * 100) / 100 : 8;
}

function zonedDateKey(z: Date): string {
  const y = z.getFullYear();
  const m = String(z.getMonth() + 1).padStart(2, "0");
  const d = String(z.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" of an instant, in the org timezone. */
export function dateKeyInZone(date: Date, cal: WorkCalendar): string {
  return zonedDateKey(toZonedTime(date, cal.timezone));
}

function isWorkingDayZoned(z: Date, cal: WorkCalendar): boolean {
  if (!cal.workingDays.includes(z.getDay())) return false;
  if (cal.holidays.has(zonedDateKey(z))) return false;
  return true;
}

export function isWorkingDay(date: Date, cal: WorkCalendar): boolean {
  return isWorkingDayZoned(toZonedTime(date, cal.timezone), cal);
}

function atTimeZoned(z: Date, hm: string): Date {
  const { h, m } = parseHM(hm);
  const out = new Date(z);
  out.setHours(h, m, 0, 0);
  return out;
}

function nextDayStartZoned(z: Date, cal: WorkCalendar): Date {
  const out = new Date(z);
  out.setDate(out.getDate() + 1);
  return atTimeZoned(out, cal.workStart);
}

// ---------------------------------------------------------------------------
// Snapping
// ---------------------------------------------------------------------------

/**
 * Move an instant onto the working calendar:
 *  - before workStart      → workStart the same day
 *  - at/after workEnd      → workStart on the next working day
 *  - non-working/holiday   → workStart on the next working day
 */
export function snapToWorkingHours(date: Date, cal: WorkCalendar): Date {
  let z = toZonedTime(date, cal.timezone);

  for (let i = 0; i < MAX_DAY_SCAN; i++) {
    if (!isWorkingDayZoned(z, cal)) {
      z = nextDayStartZoned(z, cal);
      continue;
    }
    const dayStart = atTimeZoned(z, cal.workStart);
    const dayEnd = atTimeZoned(z, cal.workEnd);
    if (z < dayStart) {
      z = dayStart;
      break;
    }
    if (z >= dayEnd) {
      z = nextDayStartZoned(z, cal);
      continue;
    }
    break;
  }

  return fromZonedTime(z, cal.timezone);
}

/**
 * Walk forward through working windows only and return the instant at which
 * `hours` of work starting at `start` would be finished.
 */
export function addWorkingHours(
  start: Date,
  hours: number,
  cal: WorkCalendar,
): Date {
  if (hours <= 0) return snapToWorkingHours(start, cal);

  let z = toZonedTime(snapToWorkingHours(start, cal), cal.timezone);
  let remainingMs = hours * MS_PER_HOUR;

  for (let i = 0; i < MAX_DAY_SCAN; i++) {
    const dayEnd = atTimeZoned(z, cal.workEnd);
    const available = dayEnd.getTime() - z.getTime();

    if (remainingMs <= available) {
      z = new Date(z.getTime() + remainingMs);
      remainingMs = 0;
      break;
    }

    remainingMs -= available;
    // Jump to the start of the next working day.
    z = toZonedTime(
      snapToWorkingHours(
        fromZonedTime(nextDayStartZoned(z, cal), cal.timezone),
        cal,
      ),
      cal.timezone,
    );
  }

  return fromZonedTime(z, cal.timezone);
}

/** Working hours between two instants (partial days respected). */
export function workingHoursBetween(
  start: Date,
  end: Date,
  cal: WorkCalendar,
): number {
  if (end <= start) return 0;
  let z = toZonedTime(snapToWorkingHours(start, cal), cal.timezone);
  const zEnd = toZonedTime(end, cal.timezone);
  let total = 0;

  for (let i = 0; i < MAX_DAY_SCAN && z < zEnd; i++) {
    const dayEnd = atTimeZoned(z, cal.workEnd);
    const sliceEnd = dayEnd < zEnd ? dayEnd : zEnd;
    if (sliceEnd > z) total += (sliceEnd.getTime() - z.getTime()) / MS_PER_HOUR;
    z = toZonedTime(
      snapToWorkingHours(
        fromZonedTime(nextDayStartZoned(z, cal), cal.timezone),
        cal,
      ),
      cal.timezone,
    );
  }

  return Math.round(total * 100) / 100;
}

// ---------------------------------------------------------------------------
// Free-slot search and packing
// ---------------------------------------------------------------------------

function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && a.end > b.start;
}

/**
 * First window of `hours` working time starting at or after `from` that does
 * not overlap any `busy` range.
 */
export function nextFreeSlot(
  busy: TimeRange[],
  from: Date,
  hours: number,
  cal: WorkCalendar,
): TimeRange {
  const candidates = [
    snapToWorkingHours(from, cal),
    ...busy
      .filter((b) => b.end > from)
      .map((b) => snapToWorkingHours(b.end, cal)),
  ].sort((a, b) => a.getTime() - b.getTime());

  for (const candidate of candidates) {
    const slot = {
      start: candidate,
      end: addWorkingHours(candidate, hours, cal),
    };
    if (!busy.some((b) => overlaps(slot, b))) return slot;
  }

  // Unreachable in practice: the last busy end is always a free candidate.
  const last = candidates[candidates.length - 1];
  return { start: last, end: addWorkingHours(last, hours, cal) };
}

export type PackableTask = {
  id: string;
  estimateHours: number;
  priority: number;
  createdAt: Date;
};

/**
 * Deterministic fallback scheduler. Packs `tasks` sequentially for a single
 * assignee, highest priority first (1 before 4), oldest first within the same
 * priority, starting no earlier than `from` and never inside `busy` ranges.
 */
export function packTasks(
  tasks: PackableTask[],
  from: Date,
  busy: TimeRange[],
  cal: WorkCalendar,
): Map<string, TimeRange> {
  const ordered = [...tasks].sort(
    (a, b) =>
      a.priority - b.priority || a.createdAt.getTime() - b.createdAt.getTime(),
  );
  const occupied = [...busy];
  const result = new Map<string, TimeRange>();
  let cursor = snapToWorkingHours(from, cal);

  for (const task of ordered) {
    const slot = nextFreeSlot(occupied, cursor, task.estimateHours, cal);
    result.set(task.id, slot);
    occupied.push(slot);
    cursor = slot.end;
  }

  return result;
}

/**
 * Take a (possibly off-calendar) AI-proposed start, and return a window that
 * respects the org calendar: start is snapped and never before `notBefore`,
 * end is recomputed from the estimate so it always matches.
 */
export function clampToCalendar(
  proposedStart: Date | null,
  hours: number,
  notBefore: Date,
  cal: WorkCalendar,
): TimeRange {
  const base =
    proposedStart && !Number.isNaN(proposedStart.getTime())
      ? proposedStart < notBefore
        ? notBefore
        : proposedStart
      : notBefore;
  const start = snapToWorkingHours(base, cal);
  return { start, end: addWorkingHours(start, hours, cal) };
}

// ---------------------------------------------------------------------------
// Formatting (for prompts and UI)
// ---------------------------------------------------------------------------

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function describeWorkingDays(cal: WorkCalendar): string {
  const days = [...cal.workingDays].sort();
  if (days.length === 0) return "no working days configured";
  return days.map((d) => DAY_NAMES[d] ?? String(d)).join(", ");
}

export function trimHM(value: string): string {
  const { h, m } = parseHM(value);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Human-readable rules block for the AI prompt. */
export function describeCalendarRules(
  cal: WorkCalendar,
  now: Date = new Date(),
): string {
  const upcomingHolidays = [...cal.holidays]
    .filter((d) => d >= dateKeyInZone(now, cal))
    .sort()
    .slice(0, 20);

  return [
    `Working days: ${describeWorkingDays(cal)}.`,
    `Working hours: ${trimHM(cal.workStart)}–${trimHM(cal.workEnd)} (${hoursPerDay(cal)} hours = 1 working day).`,
    `Timezone: ${cal.timezone}.`,
    upcomingHolidays.length
      ? `Holidays (no work): ${upcomingHolidays.join(", ")}.`
      : "Holidays: none scheduled.",
    "Never schedule outside working hours, on non-working days, or on holidays.",
  ].join("\n");
}

export function formatInOrgZone(
  date: Date,
  cal: WorkCalendar,
  pattern = "EEE d MMM, HH:mm",
): string {
  return formatInTimeZone(date, cal.timezone, pattern);
}

export function toIsoInOrgZone(date: Date, cal: WorkCalendar): string {
  return formatInTimeZone(date, cal.timezone, "yyyy-MM-dd'T'HH:mm:ssXXX");
}
