"use server";

import { db } from "@/lib/db";
import { updates, aiSummaries } from "@/lib/db/schema";
import { eq, gte, desc, and } from "drizzle-orm";
import { AI_MODEL, getOpenAI } from "@/lib/ai/client";
import { requireOrgMember, requireUser } from "./org-auth";

export async function generateSummary(organizationId: string) {
  const userId = await requireUser();
  await requireOrgMember(organizationId, userId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayUpdates = await db
    .select()
    .from(updates)
    .where(
      and(
        eq(updates.organizationId, organizationId),
        gte(updates.createdAt, today),
      ),
    )
    .orderBy(desc(updates.createdAt));

  if (todayUpdates.length === 0) {
    return { error: "No updates to summarize today" };
  }

  const updatesText = todayUpdates
    .map(
      (u) =>
        `${u.userName}:\n- Done: ${u.did}\n- Next: ${u.willDo}${u.blockers ? `\n- Blocker: ${u.blockers}` : ""}`,
    )
    .join("\n\n");

  const completion = await getOpenAI().chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: "system",
        content: `You are a team productivity assistant. Analyze standup updates and generate a structured summary.

Format your response as JSON with these keys:
- "progress": array of short bullet strings summarizing what was accomplished
- "blockers": array of short bullet strings listing current blockers
- "priorities": array of short bullet strings for upcoming priorities
- "insights": array of objects with "type" ("warning" | "info" | "success") and "message" string. Look for:
  - Repeated blockers across team members (warning)
  - Duplicate or overlapping work (warning)
  - High momentum areas (success)
  - Dependencies between team members (info)
  - Members who might need help (warning)
- "teamHealth": one of "great", "good", "needs-attention"

Be concise. Each bullet should be one short sentence.`,
      },
      {
        role: "user",
        content: `Analyze these standup updates:\n\n${updatesText}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const summaryContent = completion.choices[0].message.content ?? "{}";

  const [saved] = await db
    .insert(aiSummaries)
    .values({
      organizationId,
      summary: summaryContent,
      generatedBy: userId,
      date: today,
    })
    .returning();

  return { data: saved };
}

export async function getLatestSummary(organizationId: string) {
  const userId = await requireUser();
  await requireOrgMember(organizationId, userId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [summary] = await db
    .select()
    .from(aiSummaries)
    .where(
      and(
        eq(aiSummaries.organizationId, organizationId),
        gte(aiSummaries.date, today),
      ),
    )
    .orderBy(desc(aiSummaries.createdAt))
    .limit(1);

  return summary ?? null;
}
