import { connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { Sidebar } from "@/components/dashboard/sidebar";
import { resolveActiveOrg } from "@/lib/actions/resolve-org";
import { getOrgCalendarSettings } from "@/lib/actions/organizations";
import { SettingsPanel } from "@/components/dashboard/settings-panel";

export default async function SettingsPage(props: {
  searchParams: Promise<{ orgId?: string }>;
}) {
  await connection();
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const searchParams = await props.searchParams;
  const { userOrgs, activeOrg } = await resolveActiveOrg(searchParams.orgId);

  if (!activeOrg) redirect("/dashboard");

  const { calendar, holidays } = await getOrgCalendarSettings(
    activeOrg.organizationId,
  );

  return (
    <AppShell
      sidebar={
        <Sidebar orgs={userOrgs} activeOrgId={activeOrg.organizationId} />
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
            Workspace name, working calendar and membership
          </p>
        </div>

        <SettingsPanel
          organizationId={activeOrg.organizationId}
          organizationName={activeOrg.name}
          isAdmin={activeOrg.role === "admin"}
          calendar={calendar}
          holidays={holidays.map((h) => ({
            id: h.id,
            date: h.date,
            label: h.label,
          }))}
        />
      </div>
    </AppShell>
  );
}
