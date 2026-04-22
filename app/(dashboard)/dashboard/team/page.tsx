import { connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getTeamMembersWithUsers } from "@/lib/actions/teams";
import { resolveActiveTeam } from "@/lib/actions/resolve-team";
import { TeamMembersList } from "@/components/dashboard/team-members-list";
import { InviteLink } from "@/components/dashboard/invite-link";

export default async function TeamPage(props: {
  searchParams: Promise<{ teamId?: string }>;
}) {
  await connection();
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const searchParams = await props.searchParams;
  const { userTeams, activeTeam } = await resolveActiveTeam(
    searchParams.teamId,
  );

  if (!activeTeam) redirect("/dashboard");

  const members = await getTeamMembersWithUsers(activeTeam.teamId);
  const isAdmin = activeTeam.role === "admin";

  return (
    <AppShell
      sidebar={
        <Sidebar teams={userTeams} activeTeamId={activeTeam.teamId} />
      }
    >
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
              TEAM
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-small)",
                color: "var(--text-secondary)",
                marginTop: "4px",
              }}
            >
              {activeTeam.teamName} · {members.length} member
              {members.length !== 1 ? "s" : ""}
            </p>
          </div>
          {isAdmin && <InviteLink teamId={activeTeam.teamId} />}
        </div>

        <TeamMembersList
          members={members}
          teamId={activeTeam.teamId}
          isAdmin={isAdmin}
          currentUserId={userId}
        />
      </div>
    </AppShell>
  );
}
