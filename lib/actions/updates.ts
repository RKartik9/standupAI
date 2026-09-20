"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { updates } from "@/lib/db/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { createUpdateSchema } from "@/lib/validations/updates";
import { revalidatePath } from "next/cache";
import { getPusher } from "@/lib/pusher/server";
import { requireOrgMember, requireUser } from "./org-auth";

export async function createUpdate(
  organizationId: string,
  formData: { did: string; willDo: string; blockers?: string },
) {
  const userId = await requireUser();
  await requireOrgMember(organizationId, userId);

  const user = await currentUser();
  if (!user) throw new Error("User not found");

  const parsed = createUpdateSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const [update] = await db
    .insert(updates)
    .values({
      organizationId,
      userId,
      userName:
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
        "Anonymous",
      userImage: user.imageUrl,
      did: parsed.data.did,
      willDo: parsed.data.willDo,
      blockers: parsed.data.blockers || null,
    })
    .returning();

  await getPusher().trigger(`org-${organizationId}`, "new-update", update);

  revalidatePath("/dashboard");
  return { data: update };
}

export async function getTodayUpdates(organizationId: string) {
  const userId = await requireUser();
  await requireOrgMember(organizationId, userId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return db
    .select()
    .from(updates)
    .where(
      and(
        eq(updates.organizationId, organizationId),
        gte(updates.createdAt, today),
      ),
    )
    .orderBy(desc(updates.createdAt));
}

export async function getRecentUpdates(organizationId: string, limit = 20) {
  const userId = await requireUser();
  await requireOrgMember(organizationId, userId);

  return db
    .select()
    .from(updates)
    .where(eq(updates.organizationId, organizationId))
    .orderBy(desc(updates.createdAt))
    .limit(limit);
}
