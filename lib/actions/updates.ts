"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { updates, teamMembers } from "@/lib/db/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { createUpdateSchema } from "@/lib/validations/updates";
import { revalidatePath } from "next/cache";
import { getPusher } from "@/lib/pusher/server";

export async function createUpdate(
  teamId: string,
  formData: { did: string; willDo: string; blockers?: string },
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await currentUser();
  if (!user) throw new Error("User not found");

  const parsed = createUpdateSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const membership = await db
    .select()
    .from(teamMembers)
    .where(
      and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)),
    );

  if (membership.length === 0) throw new Error("Not a member of this team");

  const [update] = await db
    .insert(updates)
    .values({
      teamId,
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

  await getPusher().trigger(`team-${teamId}`, "new-update", update);

  revalidatePath("/dashboard");
  return { data: update };
}

export async function getTodayUpdates(teamId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return db
    .select()
    .from(updates)
    .where(and(eq(updates.teamId, teamId), gte(updates.createdAt, today)))
    .orderBy(desc(updates.createdAt));
}

export async function getRecentUpdates(teamId: string, limit = 20) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db
    .select()
    .from(updates)
    .where(eq(updates.teamId, teamId))
    .orderBy(desc(updates.createdAt))
    .limit(limit);
}
