import * as z from "zod";

const HM = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100),
  timezone: z
    .string()
    .max(64)
    .optional()
    .refine((tz) => !tz || isValidTimezone(tz), "Unknown timezone"),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const calendarSchema = z
  .object({
    workingDays: z
      .array(z.number().int().min(0).max(6))
      .min(1, "Pick at least one working day")
      .max(7),
    workStart: z.string().regex(HM, "Use HH:mm"),
    workEnd: z.string().regex(HM, "Use HH:mm"),
    timezone: z
      .string()
      .min(1)
      .max(64)
      .refine(isValidTimezone, "Unknown timezone"),
  })
  .refine((c) => c.workStart < c.workEnd, {
    message: "End time must be after start time",
    path: ["workEnd"],
  });

export type CalendarInput = z.infer<typeof calendarSchema>;

export const holidaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  label: z.string().min(1, "Label is required").max(100),
});

export type HolidayInput = z.infer<typeof holidaySchema>;
