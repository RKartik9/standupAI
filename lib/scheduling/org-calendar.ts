import { db } from "@/lib/db";
import { organizations, organizationHolidays } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  DEFAULT_TIMEZONE,
  DEFAULT_WORK_END,
  DEFAULT_WORK_START,
  DEFAULT_WORKING_DAYS,
  type WorkCalendar,
} from "./calendar";

/**
 * Build the organization's WorkCalendar from the DB. Falls back to the
 * product defaults (Mon–Sat 10:00–18:00) for anything not configured.
 */
export async function getOrgCalendar(
  organizationId: string,
): Promise<WorkCalendar> {
  const [org] = await db
    .select({
      workingDays: organizations.workingDays,
      workStart: organizations.workStart,
      workEnd: organizations.workEnd,
      timezone: organizations.timezone,
    })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  const holidays = await db
    .select({ date: organizationHolidays.date })
    .from(organizationHolidays)
    .where(eq(organizationHolidays.organizationId, organizationId));

  return {
    workingDays:
      org?.workingDays && org.workingDays.length > 0
        ? org.workingDays
        : DEFAULT_WORKING_DAYS,
    workStart: org?.workStart ?? DEFAULT_WORK_START,
    workEnd: org?.workEnd ?? DEFAULT_WORK_END,
    timezone: org?.timezone ?? DEFAULT_TIMEZONE,
    holidays: new Set(holidays.map((h) => h.date)),
  };
}

/** Serialisable form for passing the calendar to client components. */
export type SerializedCalendar = Omit<WorkCalendar, "holidays"> & {
  holidays: string[];
};

export function serializeCalendar(cal: WorkCalendar): SerializedCalendar {
  return { ...cal, holidays: [...cal.holidays].sort() };
}

export function deserializeCalendar(cal: SerializedCalendar): WorkCalendar {
  return { ...cal, holidays: new Set(cal.holidays) };
}
