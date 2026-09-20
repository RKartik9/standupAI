import { connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { Sidebar } from "@/components/dashboard/sidebar";
import { resolveActiveOrg } from "@/lib/actions/resolve-org";
import { getProjects } from "@/lib/actions/projects";
import { getOrganization } from "@/lib/actions/organizations";
import { ProjectList } from "@/components/projects/project-list";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { DEFAULT_TIMEZONE } from "@/lib/scheduling/calendar";

export default async function ProjectsPage(props: {
  searchParams: Promise<{ orgId?: string }>;
}) {
  await connection();
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const searchParams = await props.searchParams;
  const { userOrgs, activeOrg } = await resolveActiveOrg(searchParams.orgId);
  if (!activeOrg) redirect("/dashboard");

  const orgId = activeOrg.organizationId;
  const [projects, org] = await Promise.all([
    getProjects(orgId),
    getOrganization(orgId),
  ]);

  return (
    <AppShell sidebar={<Sidebar orgs={userOrgs} activeOrgId={orgId} />}>
      <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-h2)",
                color: "var(--text-primary)",
                fontWeight: 400,
              }}
            >
              PROJECTS
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-small)",
                color: "var(--text-secondary)",
                marginTop: "4px",
              }}
            >
              {activeOrg.name} · {projects.length} project
              {projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <CreateProjectForm organizationId={orgId} />
        </div>

        <ProjectList
          projects={projects}
          organizationId={orgId}
          timezone={org?.timezone ?? DEFAULT_TIMEZONE}
        />
      </div>
    </AppShell>
  );
}
