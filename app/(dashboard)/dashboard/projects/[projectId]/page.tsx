import { connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { AppShell } from "@/components/dashboard/app-shell";
import { Sidebar } from "@/components/dashboard/sidebar";
import { resolveActiveOrg } from "@/lib/actions/resolve-org";
import { getProject } from "@/lib/actions/projects";
import { getProjectScheduleEvents, getProjectTasks } from "@/lib/actions/tasks";
import { getOrganizationMembers } from "@/lib/actions/organizations";
import { getOrgTeams } from "@/lib/actions/teams";
import { getOrgCalendar, serializeCalendar } from "@/lib/scheduling/org-calendar";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { memberName } from "@/components/projects/priority";

export default async function ProjectDetailPage(props: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ orgId?: string }>;
}) {
  await connection();
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [{ projectId }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const project = await getProject(projectId);
  if (!project) notFound();

  // The project decides the active org; membership was checked in getProject.
  const { userOrgs, activeOrg } = await resolveActiveOrg(project.organizationId);
  if (!activeOrg) redirect("/dashboard");
  void searchParams;

  const orgId = project.organizationId;
  const [tasks, events, members, teams, calendar] = await Promise.all([
    getProjectTasks(projectId),
    getProjectScheduleEvents(projectId),
    getOrganizationMembers(orgId),
    getOrgTeams(orgId),
    getOrgCalendar(orgId),
  ]);

  return (
    <AppShell sidebar={<Sidebar orgs={userOrgs} activeOrgId={orgId} />}>
      <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div>
          <Link
            href={`/dashboard/projects?orgId=${orgId}`}
            className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            All projects
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h2)",
              color: "var(--text-primary)",
              fontWeight: 400,
            }}
          >
            {project.name.toUpperCase()}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-small)",
              color: "var(--text-secondary)",
              marginTop: "4px",
            }}
          >
            {project.description ? `${project.description} · ` : ""}
            starts {formatInTimeZone(project.startDate, calendar.timezone, "d MMM yyyy")} ·{" "}
            {calendar.timezone}
          </p>
        </div>

        <ProjectWorkspace
          projectId={project.id}
          organizationId={orgId}
          projectStart={project.startDate}
          tasks={tasks}
          events={events}
          members={members.map((m) => ({
            userId: m.userId,
            name: memberName(m.firstName, m.lastName, m.email),
          }))}
          teams={teams.map((t) => ({ id: t.id, name: t.name }))}
          calendar={serializeCalendar(calendar)}
        />
      </div>
    </AppShell>
  );
}
