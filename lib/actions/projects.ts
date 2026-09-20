"use server";

import { db } from "@/lib/db";
import { projects, tasks } from "@/lib/db/schema";
import { and, asc, count, desc, eq, max, min, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createProjectSchema } from "@/lib/validations/projects";
import { requireOrgMember, requireUser } from "./org-auth";

export async function createProject(
  organizationId: string,
  formData: { name: string; description?: string; startDate?: string },
) {
  const userId = await requireUser();
  await requireOrgMember(organizationId, userId);

  const parsed = createProjectSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const startDate = parsed.data.startDate
    ? new Date(`${parsed.data.startDate}T00:00:00`)
    : new Date();

  const [project] = await db
    .insert(projects)
    .values({
      organizationId,
      name: parsed.data.name,
      description: parsed.data.description?.trim() || null,
      startDate,
      createdBy: userId,
    })
    .returning();

  revalidatePath("/dashboard/projects");
  return { data: project };
}

export async function getProjects(organizationId: string) {
  const userId = await requireUser();
  await requireOrgMember(organizationId, userId);

  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      startDate: projects.startDate,
      status: projects.status,
      createdAt: projects.createdAt,
      taskCount: count(tasks.id),
      doneCount:
        sql<number>`COUNT(CASE WHEN ${tasks.status} = 'done' THEN 1 END)`.as(
          "done_count",
        ),
      firstStart: min(tasks.scheduledStart),
      lastEnd: max(tasks.scheduledEnd),
    })
    .from(projects)
    .leftJoin(tasks, eq(tasks.projectId, projects.id))
    .where(eq(projects.organizationId, organizationId))
    .groupBy(projects.id)
    .orderBy(desc(projects.status), asc(projects.createdAt));

  return rows.map((r) => ({
    ...r,
    taskCount: Number(r.taskCount),
    doneCount: Number(r.doneCount),
  }));
}

export async function getProject(projectId: string) {
  const userId = await requireUser();

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) return null;

  await requireOrgMember(project.organizationId, userId);
  return project;
}

export async function setProjectStatus(
  projectId: string,
  status: "active" | "archived",
) {
  const userId = await requireUser();
  const project = await getProject(projectId);
  if (!project) throw new Error("Project not found");
  await requireOrgMember(project.organizationId, userId);

  await db
    .update(projects)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(projects.id, projectId)));

  revalidatePath("/dashboard/projects");
  return { success: true };
}
