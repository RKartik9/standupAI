"use server";

import { db } from "@/lib/db";
import { updates, organizationMembers } from "@/lib/db/schema";
import { eq, and, gte, desc, sql, count } from "drizzle-orm";
import { requireOrgMember, requireUser } from "./org-auth";

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizeKey(val: unknown): string {
  if (val instanceof Date) return toDateKey(val);
  const s = String(val);
  if (s.includes("T")) return s.split("T")[0];
  return s;
}

export async function getOrgAnalytics(organizationId: string) {
  const userId = await requireUser();
  await requireOrgMember(organizationId, userId);

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dateSql = sql<string>`to_char(${updates.createdAt}, 'YYYY-MM-DD')`;

  const [
    dailyUpdates,
    memberActivity,
    blockerData,
    recentUpdates,
    totalMembers,
  ] = await Promise.all([
    db
      .select({
        date: dateSql.as("date"),
        count: count().as("count"),
      })
      .from(updates)
      .where(
        and(
          eq(updates.organizationId, organizationId),
          gte(updates.createdAt, sevenDaysAgo),
        ),
      )
      .groupBy(dateSql)
      .orderBy(dateSql),

    db
      .select({
        userName: updates.userName,
        userImage: updates.userImage,
        count: count().as("count"),
      })
      .from(updates)
      .where(
        and(
          eq(updates.organizationId, organizationId),
          gte(updates.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(updates.userName, updates.userImage)
      .orderBy(desc(count())),

    db
      .select({
        date: dateSql.as("date"),
        total: count().as("total"),
        withBlockers:
          sql<number>`COUNT(CASE WHEN ${updates.blockers} IS NOT NULL AND ${updates.blockers} != '' THEN 1 END)`.as(
            "with_blockers",
          ),
      })
      .from(updates)
      .where(
        and(
          eq(updates.organizationId, organizationId),
          gte(updates.createdAt, sevenDaysAgo),
        ),
      )
      .groupBy(dateSql)
      .orderBy(dateSql),

    db
      .select({
        userId: updates.userId,
        userName: updates.userName,
        userImage: updates.userImage,
        date: dateSql.as("date"),
      })
      .from(updates)
      .where(
        and(
          eq(updates.organizationId, organizationId),
          gte(updates.createdAt, sevenDaysAgo),
        ),
      )
      .groupBy(updates.userId, updates.userName, updates.userImage, dateSql),

    db
      .select({ count: count() })
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, organizationId)),
  ]);

  const dayLabels = [];
  const dayMap = new Map(
    dailyUpdates.map((d) => [normalizeKey(d.date), Number(d.count)]),
  );
  const blockerMap = new Map(
    blockerData.map((d) => [
      normalizeKey(d.date),
      { total: Number(d.total), withBlockers: Number(d.withBlockers) },
    ]),
  );

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const bData = blockerMap.get(key);
    dayLabels.push({
      day: label,
      date: key,
      updates: dayMap.get(key) ?? 0,
      blockers: bData?.withBlockers ?? 0,
      total: bData?.total ?? 0,
    });
  }

  const memberDays = new Map<
    string,
    { name: string; image: string | null; days: Set<string> }
  >();
  for (const row of recentUpdates) {
    if (!memberDays.has(row.userId)) {
      memberDays.set(row.userId, {
        name: row.userName,
        image: row.userImage,
        days: new Set(),
      });
    }
    memberDays.get(row.userId)!.days.add(normalizeKey(row.date));
  }

  const streaks = Array.from(memberDays.entries()).map(
    ([id, { name, image, days }]) => {
      let streak = 0;
      for (let i = 0; i <= 6; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = toDateKey(d);
        if (days.has(key)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
      return { userId: id, name, image, streak, totalDays: days.size };
    },
  );
  streaks.sort((a, b) => b.streak - a.streak);

  const todayKey = toDateKey(now);
  const todayUpdates = dayMap.get(todayKey) ?? 0;
  const totalMembersCount = totalMembers[0]?.count ?? 0;
  const todayBlockers = blockerMap.get(todayKey)?.withBlockers ?? 0;

  const todayPosters = new Set(
    recentUpdates
      .filter((r) => normalizeKey(r.date) === todayKey)
      .map((r) => r.userId),
  );

  return {
    dailyChart: dayLabels,
    memberActivity: memberActivity.map((m) => ({
      name: m.userName,
      image: m.userImage,
      updates: Number(m.count),
    })),
    streaks,
    stats: {
      todayUpdates,
      totalMembers: totalMembersCount,
      participation:
        totalMembersCount > 0
          ? Math.round((todayPosters.size / totalMembersCount) * 100)
          : 0,
      todayBlockers,
      weeklyTotal: dayLabels.reduce((s, d) => s + d.updates, 0),
    },
  };
}
