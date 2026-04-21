import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  rightPanel?: React.ReactNode;
  className?: string;
}

export function AppShell({
  children,
  sidebar,
  rightPanel,
  className,
}: AppShellProps) {
  return (
    <div className={cn("flex h-screen overflow-hidden", className)}>
      {/* Left Sidebar */}
      <aside className="w-64 border-r bg-muted/10 flex-shrink-0">
        {sidebar}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Right Panel */}
      {rightPanel && (
        <aside className="w-80 border-l bg-muted/10 flex-shrink-0 overflow-y-auto">
          {rightPanel}
        </aside>
      )}
    </div>
  );
}
