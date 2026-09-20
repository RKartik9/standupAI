"use server";

import { db } from "@/lib/db";
import { invites, organizationMembers, organizations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { requireOrgAdmin, requireUser } from "./org-auth";

function generateCode() {
  return randomBytes(6).toString("base64url").slice(0, 10);
}

export async function createInviteLink(organizationId: string) {
  const userId = await requireUser();
  await requireOrgAdmin(organizationId, userId);

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [invite] = await db
    .insert(invites)
    .values({ organizationId, code, createdBy: userId, expiresAt })
    .returning();

  return invite;
}

export async function getOrganizationInvites(organizationId: string) {
  const userId = await requireUser();
  await requireOrgAdmin(organizationId, userId);

  return db
    .select()
    .from(invites)
    .where(eq(invites.organizationId, organizationId));
}

export async function joinOrganizationByCode(code: string) {
  const userId = await requireUser();

  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.code, code))
    .limit(1);

  if (!invite) return { error: "Invalid invite code" };

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return { error: "This invite has expired" };
  }

  const [org] = await db
    .select({ licenseStatus: organizations.licenseStatus })
    .from(organizations)
    .where(eq(organizations.id, invite.organizationId))
    .limit(1);
  if (!org) return { error: "This workspace no longer exists" };
  if (org.licenseStatus !== "active") {
    return { error: "This workspace's license is not active" };
  }

  const existing = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, invite.organizationId),
        eq(organizationMembers.userId, userId),
      ),
    );

  if (existing.length > 0) {
    return { error: "You are already a member of this workspace" };
  }

  await db.insert(organizationMembers).values({
    organizationId: invite.organizationId,
    userId,
    role: "member",
  });

  revalidatePath("/dashboard");
  return { data: { organizationId: invite.organizationId } };
}
