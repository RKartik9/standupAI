import { connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { Sidebar } from "@/components/dashboard/sidebar";
import { AISummaryPanel } from "@/components/dashboard/ai-summary-panel";
import { StandupForm } from "@/components/forms/standup-form";
import { UpdatesFeed } from "@/components/dashboard/updates-feed";
import { getTodayUpdates } from "@/lib/actions/updates";
import { getLatestSummary } from "@/lib/actions/ai";
import { getTeamAnalytics } from "@/lib/actions/analytics";
import { syncUser } from "@/lib/actions/users";
import { resolveActiveTeam } from "@/lib/actions/resolve-team";
import { TeamSetup } from "@/components/dashboard/team-setup";
import { TeamPulse } from "@/components/dashboard/team-pulse";

export default async function DashboardPage(props: {
  searchParams: Promise<{ teamId?: string }>;
}) {
  await connection();
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await syncUser();

  const searchParams = await props.searchParams;
  const { userTeams, activeTeam } = await resolveActiveTeam(
    searchParams.teamId,
  );

  if (!activeTeam) {
    return (
      <AppShell sidebar={<Sidebar teams={[]} activeTeamId={null} />}>
        <div className="flex flex-1 items-center justify-center px-4">
          <TeamSetup />
        </div>
      </AppShell>
    );
  }

  const [todayUpdates, latestSummary, analytics] = await Promise.all([
    getTodayUpdates(activeTeam.teamId),
    getLatestSummary(activeTeam.teamId),
    getTeamAnalytics(activeTeam.teamId),
  ]);

  return (
    <AppShell
      sidebar={
        <Sidebar teams={userTeams} activeTeamId={activeTeam.teamId} />
      }
      rightPanel={
        <AISummaryPanel
          teamId={activeTeam.teamId}
          summary={latestSummary}
        />
      }
    >
      <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
        {/* Team Pulse */}
        <TeamPulse stats={analytics.stats} />

        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h2)",
              color: "var(--text-primary)",
              fontWeight: 400,
            }}
          >
            POST YOUR UPDATE
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-small)",
              color: "var(--text-secondary)",
              marginTop: "4px",
            }}
          >
            Share what you've been working on with your team
          </p>
        </div>

        <StandupForm teamId={activeTeam.teamId} />

        <div className="pt-8">
          <UpdatesFeed updates={todayUpdates} teamId={activeTeam.teamId} />
        </div>
      </div>
    </AppShell>
  );
}
