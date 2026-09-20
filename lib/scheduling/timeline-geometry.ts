import { toZonedTime } from "date-fns-tz";
import { parseHM, type WorkCalendar } from "./calendar";

/**
 * Client-safe geometry for the swimlane timeline. Positions are expressed as
 * "day index + fraction of the working window" so a 10:00–18:00 org and a
 * 09:00–17:00 org both render full-width bars for a full day of work.
 */

export type DayColumn = {
  key: string; // YYYY-MM-DD in org tz
  label: string; // "Mon 21"
  weekday: number;
  working: boolean;
  isToday: boolean;
};

function zonedKey(z: Date): string {
  const y = z.getFullYear();
  const m = String(z.getMonth() + 1).padStart(2, "0");
  const d = String(z.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfZonedDay(z: Date): Date {
  const out = new Date(z);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function buildDayColumns(
  rangeStart: Date,
  rangeEnd: Date,
  cal: WorkCalendar,
  now: Date = new Date(),
): DayColumn[] {
  const first = startOfZonedDay(toZonedTime(rangeStart, cal.timezone));
  const last = startOfZonedDay(toZonedTime(rangeEnd, cal.timezone));
  const todayKey = zonedKey(toZonedTime(now, cal.timezone));
  const cols: DayColumn[] = [];
  const cursor = new Date(first);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i < 400 && cursor <= last; i++) {
    const key = zonedKey(cursor);
    const weekday = cursor.getDay();
    cols.push({
      key,
      label: `${dayNames[weekday]} ${cursor.getDate()}`,
      weekday,
      working: cal.workingDays.includes(weekday) && !cal.holidays.has(key),
      isToday: key === todayKey,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return cols;
}

/** 0..1 position of an instant inside its day's working window. */
function windowFraction(z: Date, cal: WorkCalendar): number {
  const s = parseHM(cal.workStart);
  const e = parseHM(cal.workEnd);
  const startMin = s.h * 60 + s.m;
  const endMin = e.h * 60 + e.m;
  const span = Math.max(endMin - startMin, 1);
  const cur = z.getHours() * 60 + z.getMinutes();
  return Math.min(1, Math.max(0, (cur - startMin) / span));
}

/**
 * Left/width as percentages of the full column strip.
 * `rangeStart` must be the first column's day.
 */
export function barGeometry(
  start: Date,
  end: Date,
  columns: DayColumn[],
  cal: WorkCalendar,
): { left: number; width: number } | null {
  if (columns.length === 0) return null;
  const index = new Map(columns.map((c, i) => [c.key, i]));

  const zs = toZonedTime(start, cal.timezone);
  const ze = toZonedTime(end, cal.timezone);
  const si = index.get(zonedKey(zs));
  const ei = index.get(zonedKey(ze));
  if (si === undefined && ei === undefined) return null;

  const startPos = (si ?? 0) + (si === undefined ? 0 : windowFraction(zs, cal));
  let endPos =
    (ei ?? columns.length - 1) +
    (ei === undefined ? 1 : windowFraction(ze, cal));
  // A task ending exactly at workStart of a day actually ended the previous
  // working day at workEnd; keep the bar from spilling into the next column.
  if (ei !== undefined && windowFraction(ze, cal) === 0 && endPos > startPos) {
    endPos = ei;
  }

  const total = columns.length;
  const left = (startPos / total) * 100;
  const width = Math.max(((endPos - startPos) / total) * 100, 0.8);
  return { left, width };
}
