"use server";

import { db } from "@/lib/db";
import { organizationMembers, teamMembers, teams } from "@/lib/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createTeamSchema } from "@/lib/validations/teams";
import { requireOrgAdmin, requireOrgMember, requireUser } from "./org-auth";

/** Teams the admin has created inside an organization. */
export async function getOrgTeams(
  organizationId: string,
  opts: { includeArchived?: boolean } = {},
) {
  const userId = await requireUser();
  await requireOrgMember(organizationId, userId);

  const rows = await db
    .select()
    .from(teams)
    .where(eq(teams.organizationId, organizationId))
    .orderBy(asc(teams.createdAt));

  return opts.includeArchived ? rows : rows.filter((t) => !t.archived);
}

export async function createTeam(organizationId: string, formData: { name: string }) {
  const userId = await requireUser();
  await requireOrgAdmin(organizationId, userId);

  const parsed = createTeamSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const [team] = await db
    .insert(teams)
    .values({
      organizationId,
      name: parsed.data.name,
      createdBy: userId,
    })
    .returning();

  revalidatePath("/dashboard");
  return { data: team };
}

export async function renameTeam(teamId: string, name: string) {
  const userId = await requireUser();
  const team = await loadTeam(teamId);
  await requireOrgAdmin(team.organizationId, userId);

  const parsed = createTeamSchema.safeParse({ name });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const [updated] = await db
    .update(teams)
    .set({ name: parsed.data.name, updatedAt: new Date() })
    .where(eq(teams.id, teamId))
    .returning();

  revalidatePath("/dashboard");
  return { data: updated };
}

export async function setTeamArchived(teamId: string, archived: boolean) {
  const userId = await requireUser();
  const team = await loadTeam(teamId);
  await requireOrgAdmin(team.organizationId, userId);

  await db
    .update(teams)
    .set({ archived, updatedAt: new Date() })
    .where(eq(teams.id, teamId));

  revalidatePath("/dashboard");
  return { success: true };
}

/** Replace the set of teams a member belongs to within an organization. */
export async function setMemberTeams(
  organizationId: string,
  memberUserId: string,
  teamIds: string[],
) {
  const userId = await requireUser();
  await requireOrgAdmin(organizationId, userId);

  // Target must be an org member.
  const [member] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, memberUserId),
      ),
    )
    .limit(1);
  if (!member) return { error: "That person is not in this organization" };

  const orgTeams = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.organizationId, organizationId));
  const validIds = new Set(orgTeams.map((t) => t.id));
  const wanted = [...new Set(teamIds)].filter((id) => validIds.has(id));

  if (orgTeams.length > 0) {
    await db
      .delete(teamMembers)
      .where(
        and(
          inArray(
            teamMembers.teamId,
            orgTeams.map((t) => t.id),
          ),
          eq(teamMembers.userId, memberUserId),
        ),
      );
  }

  if (wanted.length > 0) {
    await db
      .insert(teamMembers)
      .values(wanted.map((teamId) => ({ teamId, userId: memberUserId })))
      .onConflictDoNothing();
  }

  revalidatePath("/dashboard/team");
  return { success: true, data: { teamIds: wanted } };
}

/** teamId → userIds and userId → teamIds for an org (for UI + AI context). */
export async function getTeamMemberships(organizationId: string) {
  const userId = await requireUser();
  await requireOrgMember(organizationId, userId);

  const orgTeams = await db
    .select({ id: teams.id, name: teams.name, archived: teams.archived })
    .from(teams)
    .where(eq(teams.organizationId, organizationId));
  if (orgTeams.length === 0) return [];

  return db
    .select({
      teamId: teamMembers.teamId,
      userId: teamMembers.userId,
    })
    .from(teamMembers)
    .where(
      inArray(
        teamMembers.teamId,
        orgTeams.map((t) => t.id),
      ),
    );
}

async function loadTeam(teamId: string) {
  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);
  if (!team) throw new Error("Team not found");
  return team;
}
