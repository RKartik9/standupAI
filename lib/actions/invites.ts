"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { invites, teamMembers, teams } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

function generateCode() {
  return randomBytes(6).toString("base64url").slice(0, 10);
}

export async function createInviteLink(teamId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const membership = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.userId, userId),
        eq(teamMembers.role, "admin"),
      ),
    );

  if (membership.length === 0) throw new Error("Only admins can create invites");

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [invite] = await db
    .insert(invites)
    .values({ teamId, code, createdBy: userId, expiresAt })
    .returning();

  return invite;
}

export async function getTeamInvites(teamId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db
    .select()
    .from(invites)
    .where(eq(invites.teamId, teamId));
}

export async function joinTeamByCode(code: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.code, code))
    .limit(1);

  if (!invite) return { error: "Invalid invite code" };

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return { error: "This invite has expired" };
  }

  const existing = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.teamId, invite.teamId),
        eq(teamMembers.userId, userId),
      ),
    );

  if (existing.length > 0) {
    return { error: "You are already a member of this team" };
  }

  await db.insert(teamMembers).values({
    teamId: invite.teamId,
    userId,
    role: "member",
  });

  revalidatePath("/dashboard");
  return { data: { teamId: invite.teamId } };
}
