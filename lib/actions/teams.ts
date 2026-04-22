"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { teams, teamMembers, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createTeamSchema } from "@/lib/validations/teams";
import { revalidatePath } from "next/cache";

export async function createTeam(formData: { name: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = createTeamSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const [team] = await db
    .insert(teams)
    .values({
      name: parsed.data.name,
      createdBy: userId,
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId,
    role: "admin",
  });

  revalidatePath("/dashboard");
  return { data: team };
}

export async function updateTeamName(teamId: string, name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await requireAdmin(teamId, userId);

  const parsed = createTeamSchema.safeParse({ name });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const [team] = await db
    .update(teams)
    .set({ name: parsed.data.name, updatedAt: new Date() })
    .where(eq(teams.id, teamId))
    .returning();

  revalidatePath("/dashboard");
  return { data: team };
}

export async function getUserTeams() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db
    .select({
      teamId: teamMembers.teamId,
      role: teamMembers.role,
      teamName: teams.name,
      createdAt: teams.createdAt,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, userId));
}

export async function getTeamMembersWithUsers(teamId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await requireMember(teamId, userId);

  return db
    .select({
      id: teamMembers.id,
      userId: teamMembers.userId,
      role: teamMembers.role,
      joinedAt: teamMembers.joinedAt,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      imageUrl: users.imageUrl,
    })
    .from(teamMembers)
    .leftJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, teamId));
}

export async function removeMember(teamId: string, memberId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await requireAdmin(teamId, userId);

  if (memberId === userId) {
    return { error: "You cannot remove yourself" };
  }

  await db
    .delete(teamMembers)
    .where(
      and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, memberId)),
    );

  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function changeMemberRole(
  teamId: string,
  memberId: string,
  role: "admin" | "member",
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await requireAdmin(teamId, userId);

  if (memberId === userId) {
    return { error: "You cannot change your own role" };
  }

  await db
    .update(teamMembers)
    .set({ role })
    .where(
      and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, memberId)),
    );

  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function leaveTeam(teamId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const members = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));

  const me = members.find((m) => m.userId === userId);
  if (!me) throw new Error("Not a member");

  const admins = members.filter((m) => m.role === "admin");
  if (me.role === "admin" && admins.length === 1) {
    return { error: "You are the only admin. Promote another member first." };
  }

  await db
    .delete(teamMembers)
    .where(
      and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)),
    );

  revalidatePath("/dashboard");
  return { success: true };
}

async function requireMember(teamId: string, userId: string) {
  const rows = await db
    .select()
    .from(teamMembers)
    .where(
      and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)),
    );
  if (rows.length === 0) throw new Error("Not a member of this team");
  return rows[0];
}

async function requireAdmin(teamId: string, userId: string) {
  const m = await requireMember(teamId, userId);
  if (m.role !== "admin") throw new Error("Admin access required");
  return m;
}
