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
import { getOrgAnalytics } from "@/lib/actions/analytics";
import { syncUser } from "@/lib/actions/users";
import { resolveActiveOrg } from "@/lib/actions/resolve-org";
import { TeamSetup } from "@/components/dashboard/team-setup";
import { TeamPulse } from "@/components/dashboard/team-pulse";

export default async function DashboardPage(props: {
  searchParams: Promise<{ orgId?: string }>;
}) {
  await connection();
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await syncUser();

  const searchParams = await props.searchParams;
  const { userOrgs, activeOrg } = await resolveActiveOrg(searchParams.orgId);

  if (!activeOrg) {
    return (
      <AppShell sidebar={<Sidebar orgs={[]} activeOrgId={null} />}>
        <div className="flex flex-1 items-center justify-center px-4">
          <TeamSetup />
        </div>
      </AppShell>
    );
  }

  const orgId = activeOrg.organizationId;
  const [todayUpdates, latestSummary, analytics] = await Promise.all([
    getTodayUpdates(orgId),
    getLatestSummary(orgId),
    getOrgAnalytics(orgId),
  ]);

  return (
    <AppShell
      sidebar={<Sidebar orgs={userOrgs} activeOrgId={orgId} />}
      rightPanel={
        <AISummaryPanel organizationId={orgId} summary={latestSummary} />
      }
    >
      <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
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
            Share what you&apos;ve been working on with {activeOrg.name}
          </p>
        </div>

        <StandupForm organizationId={orgId} />

        <div className="pt-8">
          <UpdatesFeed updates={todayUpdates} organizationId={orgId} />
        </div>
      </div>
    </AppShell>
  );
}
