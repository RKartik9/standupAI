import { AppShell } from "@/components/dashboard/app-shell";
import { Sidebar } from "@/components/dashboard/sidebar";
import { AISummaryPanel } from "@/components/dashboard/ai-summary-panel";
import { StandupForm } from "@/components/forms/standup-form";
import { UpdatesFeed } from "@/components/dashboard/updates-feed";

export default function DashboardPage() {
  return (
    <AppShell
      sidebar={<Sidebar />}
      rightPanel={<AISummaryPanel />}
    >
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Post Your Update</h1>
          <p className="text-muted-foreground">
            Share what you've been working on with your team
          </p>
        </div>

        <StandupForm />

        <div className="pt-8">
          <UpdatesFeed />
        </div>
      </div>
    </AppShell>
  );
}
