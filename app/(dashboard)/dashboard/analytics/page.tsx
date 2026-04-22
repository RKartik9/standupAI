import { connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { Sidebar } from "@/components/dashboard/sidebar";
import { resolveActiveTeam } from "@/lib/actions/resolve-team";
import { getTeamAnalytics } from "@/lib/actions/analytics";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";

export default async function AnalyticsPage(props: {
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

  const analytics = await getTeamAnalytics(activeTeam.teamId);

  return (
    <AppShell
      sidebar={
        <Sidebar teams={userTeams} activeTeamId={activeTeam.teamId} />
      }
    >
      <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h2)",
              color: "var(--text-primary)",
              fontWeight: 400,
            }}
          >
            ANALYTICS
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-small)",
              color: "var(--text-secondary)",
              marginTop: "4px",
            }}
          >
            {activeTeam.teamName} · last 7 days
          </p>
        </div>

        <AnalyticsDashboard analytics={analytics} />
      </div>
    </AppShell>
  );
}
