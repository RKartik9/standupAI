import { connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getOrgTeams, getTeamMemberships } from "@/lib/actions/teams";
import { getOrganizationMembers } from "@/lib/actions/organizations";
import { resolveActiveOrg } from "@/lib/actions/resolve-org";
import { TeamMembersList } from "@/components/dashboard/team-members-list";
import { TeamsManager } from "@/components/dashboard/teams-manager";
import { InviteLink } from "@/components/dashboard/invite-link";

export default async function TeamPage(props: {
  searchParams: Promise<{ orgId?: string }>;
}) {
  await connection();
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const searchParams = await props.searchParams;
  const { userOrgs, activeOrg } = await resolveActiveOrg(searchParams.orgId);
  if (!activeOrg) redirect("/dashboard");

  const orgId = activeOrg.organizationId;
  const isAdmin = activeOrg.role === "admin";

  const [members, teams, memberships] = await Promise.all([
    getOrganizationMembers(orgId),
    getOrgTeams(orgId, { includeArchived: true }),
    getTeamMemberships(orgId),
  ]);

  const countByTeam = new Map<string, number>();
  for (const m of memberships) {
    countByTeam.set(m.teamId, (countByTeam.get(m.teamId) ?? 0) + 1);
  }

  const activeTeams = teams.filter((t) => !t.archived);

  return (
    <AppShell sidebar={<Sidebar orgs={userOrgs} activeOrgId={orgId} />}>
      <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-h2)",
                color: "var(--text-primary)",
                fontWeight: 400,
              }}
            >
              PEOPLE & TEAMS
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-small)",
                color: "var(--text-secondary)",
                marginTop: "4px",
              }}
            >
              {activeOrg.name} · {members.length} member
              {members.length !== 1 ? "s" : ""} · {activeTeams.length} team
              {activeTeams.length !== 1 ? "s" : ""}
            </p>
          </div>
          {isAdmin && <InviteLink organizationId={orgId} />}
        </div>

        <TeamsManager
          organizationId={orgId}
          isAdmin={isAdmin}
          teams={teams.map((t) => ({
            id: t.id,
            name: t.name,
            archived: t.archived,
            memberCount: countByTeam.get(t.id) ?? 0,
          }))}
        />

        <div>
          <h2
            className="mb-3"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h3)",
              color: "var(--text-primary)",
              fontWeight: 400,
              letterSpacing: "0.02em",
            }}
          >
            MEMBERS
          </h2>
          <TeamMembersList
            members={members}
            teams={activeTeams.map((t) => ({ id: t.id, name: t.name }))}
            organizationId={orgId}
            isAdmin={isAdmin}
            currentUserId={userId}
          />
        </div>
      </div>
    </AppShell>
  );
}
