"use server";

import { db } from "@/lib/db";
import {
  organizationHolidays,
  organizationMembers,
  organizations,
  teamMembers,
  teams,
  users,
} from "@/lib/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  calendarSchema,
  createOrganizationSchema,
  holidaySchema,
  type CalendarInput,
} from "@/lib/validations/organizations";
import { requireOrgAdmin, requireOrgMember, requireUser } from "./org-auth";
import { replanOrganization } from "@/lib/scheduling/replan-service";
import { getOrgCalendar, serializeCalendar } from "@/lib/scheduling/org-calendar";
import { DEFAULT_TIMEZONE } from "@/lib/scheduling/calendar";

// ---------------------------------------------------------------------------
// Create / read
// ---------------------------------------------------------------------------

export async function createOrganization(formData: {
  name: string;
  timezone?: string;
}) {
  const userId = await requireUser();

  const parsed = createOrganizationSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // License gate: one workspace per account.
  const owned = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.createdBy, userId))
    .limit(1);
  if (owned.length > 0) {
    return {
      error: {
        name: [
          "Your license covers one workspace. You already own one — switch to it from the sidebar.",
        ],
      },
    };
  }

  const [org] = await db
    .insert(organizations)
    .values({
      name: parsed.data.name,
      createdBy: userId,
      timezone: parsed.data.timezone || DEFAULT_TIMEZONE,
    })
    .returning();

  await db.insert(organizationMembers).values({
    organizationId: org.id,
    userId,
    role: "admin",
  });

  revalidatePath("/dashboard");
  return { data: org };
}

export async function getUserOrganizations() {
  const userId = await requireUser();

  return db
    .select({
      organizationId: organizationMembers.organizationId,
      role: organizationMembers.role,
      name: organizations.name,
      licenseStatus: organizations.licenseStatus,
      createdAt: organizations.createdAt,
    })
    .from(organizationMembers)
    .innerJoin(
      organizations,
      eq(organizationMembers.organizationId, organizations.id),
    )
    .where(eq(organizationMembers.userId, userId))
    .orderBy(asc(organizations.createdAt));
}

export async function getOrganization(organizationId: string) {
  const userId = await requireUser();
  await requireOrgMember(organizationId, userId);
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);
  return org ?? null;
}

export async function updateOrganizationName(
  organizationId: string,
  name: string,
) {
  const userId = await requireUser();
  await requireOrgAdmin(organizationId, userId);

  const parsed = createOrganizationSchema.pick({ name: true }).safeParse({
    name,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const [org] = await db
    .update(organizations)
    .set({ name: parsed.data.name, updatedAt: new Date() })
    .where(eq(organizations.id, organizationId))
    .returning();

  revalidatePath("/dashboard");
  return { data: org };
}

// ---------------------------------------------------------------------------
// Working calendar
// ---------------------------------------------------------------------------

export async function getOrgCalendarSettings(organizationId: string) {
  const userId = await requireUser();
  await requireOrgMember(organizationId, userId);

  const cal = await getOrgCalendar(organizationId);
  const holidays = await db
    .select()
    .from(organizationHolidays)
    .where(eq(organizationHolidays.organizationId, organizationId))
    .orderBy(asc(organizationHolidays.date));

  return { calendar: serializeCalendar(cal), holidays };
}

export async function updateOrgCalendar(
  organizationId: string,
  input: CalendarInput,
) {
  const userId = await requireUser();
  await requireOrgAdmin(organizationId, userId);

  const parsed = calendarSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await db
    .update(organizations)
    .set({
      workingDays: [...new Set(parsed.data.workingDays)].sort(),
      workStart: parsed.data.workStart,
      workEnd: parsed.data.workEnd,
      timezone: parsed.data.timezone,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, organizationId));

  const moved = await replanOrganization(
    organizationId,
    "Working calendar updated",
  );

  revalidatePath("/dashboard");
  return { data: { moved } };
}

export async function addHoliday(
  organizationId: string,
  input: { date: string; label: string },
) {
  const userId = await requireUser();
  await requireOrgAdmin(organizationId, userId);

  const parsed = holidaySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await db
    .insert(organizationHolidays)
    .values({
      organizationId,
      date: parsed.data.date,
      label: parsed.data.label,
    })
    .onConflictDoUpdate({
      target: [organizationHolidays.organizationId, organizationHolidays.date],
      set: { label: parsed.data.label },
    });

  const moved = await replanOrganization(
    organizationId,
    `Holiday added: ${parsed.data.label} (${parsed.data.date})`,
  );

  revalidatePath("/dashboard");
  return { data: { moved } };
}

export async function removeHoliday(organizationId: string, holidayId: string) {
  const userId = await requireUser();
  await requireOrgAdmin(organizationId, userId);

  await db
    .delete(organizationHolidays)
    .where(
      and(
        eq(organizationHolidays.id, holidayId),
        eq(organizationHolidays.organizationId, organizationId),
      ),
    );

  const moved = await replanOrganization(organizationId, "Holiday removed");

  revalidatePath("/dashboard");
  return { data: { moved } };
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export async function getOrganizationMembers(organizationId: string) {
  const userId = await requireUser();
  await requireOrgMember(organizationId, userId);

  const members = await db
    .select({
      id: organizationMembers.id,
      userId: organizationMembers.userId,
      role: organizationMembers.role,
      joinedAt: organizationMembers.joinedAt,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      imageUrl: users.imageUrl,
    })
    .from(organizationMembers)
    .leftJoin(users, eq(organizationMembers.userId, users.id))
    .where(eq(organizationMembers.organizationId, organizationId))
    .orderBy(asc(organizationMembers.joinedAt));

  const orgTeams = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.organizationId, organizationId));
  const teamIds = orgTeams.map((t) => t.id);

  const memberships =
    teamIds.length > 0
      ? await db
          .select({ teamId: teamMembers.teamId, userId: teamMembers.userId })
          .from(teamMembers)
          .where(inArray(teamMembers.teamId, teamIds))
      : [];

  const teamsByUser = new Map<string, string[]>();
  for (const m of memberships) {
    if (!teamsByUser.has(m.userId)) teamsByUser.set(m.userId, []);
    teamsByUser.get(m.userId)!.push(m.teamId);
  }

  return members.map((m) => ({
    ...m,
    teamIds: teamsByUser.get(m.userId) ?? [],
  }));
}

export async function removeOrgMember(organizationId: string, memberId: string) {
  const userId = await requireUser();
  await requireOrgAdmin(organizationId, userId);

  if (memberId === userId) return { error: "You cannot remove yourself" };

  const orgTeams = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.organizationId, organizationId));
  if (orgTeams.length > 0) {
    await db
      .delete(teamMembers)
      .where(
        and(
          inArray(
            teamMembers.teamId,
            orgTeams.map((t) => t.id),
          ),
          eq(teamMembers.userId, memberId),
        ),
      );
  }

  await db
    .delete(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, memberId),
      ),
    );

  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function changeOrgMemberRole(
  organizationId: string,
  memberId: string,
  role: "admin" | "member",
) {
  const userId = await requireUser();
  await requireOrgAdmin(organizationId, userId);

  if (memberId === userId) return { error: "You cannot change your own role" };

  await db
    .update(organizationMembers)
    .set({ role })
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, memberId),
      ),
    );

  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function leaveOrganization(organizationId: string) {
  const userId = await requireUser();

  const members = await db
    .select()
    .from(organizationMembers)
    .where(eq(organizationMembers.organizationId, organizationId));

  const me = members.find((m) => m.userId === userId);
  if (!me) throw new Error("Not a member");

  const admins = members.filter((m) => m.role === "admin");
  if (me.role === "admin" && admins.length === 1) {
    return { error: "You are the only admin. Promote another member first." };
  }

  const orgTeams = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.organizationId, organizationId));
  if (orgTeams.length > 0) {
    await db
      .delete(teamMembers)
      .where(
        and(
          inArray(
            teamMembers.teamId,
            orgTeams.map((t) => t.id),
          ),
          eq(teamMembers.userId, userId),
        ),
      );
  }

  await db
    .delete(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId),
      ),
    );

  revalidatePath("/dashboard");
  return { success: true };
}
