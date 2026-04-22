import { connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { Sidebar } from "@/components/dashboard/sidebar";
import { resolveActiveTeam } from "@/lib/actions/resolve-team";
import { SettingsPanel } from "@/components/dashboard/settings-panel";

export default async function SettingsPage(props: {
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

  return (
    <AppShell
      sidebar={
        <Sidebar teams={userTeams} activeTeamId={activeTeam.teamId} />
      }
    >
      <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h2)",
              color: "var(--text-primary)",
              fontWeight: 400,
            }}
          >
            SETTINGS
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-small)",
              color: "var(--text-secondary)",
              marginTop: "4px",
            }}
          >
            Manage your team settings
          </p>
        </div>

        <SettingsPanel
          teamId={activeTeam.teamId}
          teamName={activeTeam.teamName}
          isAdmin={activeTeam.role === "admin"}
        />
      </div>
    </AppShell>
  );
}
