import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { organizationMembers } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function requireOrgMember(organizationId: string, userId: string) {
  const [row] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId),
      ),
    )
    .limit(1);
  if (!row) throw new Error("Not a member of this organization");
  return row;
}

export async function requireOrgAdmin(organizationId: string, userId: string) {
  const m = await requireOrgMember(organizationId, userId);
  if (m.role !== "admin") throw new Error("Admin access required");
  return m;
}
