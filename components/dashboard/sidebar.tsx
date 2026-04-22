"use client";

import { Home, Users, Settings, ChevronDown, Check, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface TeamInfo {
  teamId: string;
  teamName: string;
  role: string;
}

interface SidebarProps {
  teams: TeamInfo[];
  activeTeamId: string | null;
}

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ teams, activeTeamId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const activeTeam = teams.find((t) => t.teamId === activeTeamId);

  const switchTeam = (teamId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("teamId", teamId);
    router.push(`${pathname}?${params.toString()}`);
    setSelectorOpen(false);
  };

  const buildHref = (base: string) => {
    if (activeTeamId) return `${base}?teamId=${activeTeamId}`;
    return base;
  };

  return (
    <div className="flex h-full flex-col px-3 py-4">
      {/* Logo */}
      <div className="mb-6 px-3">
        <Link
          href="/"
          className="flex items-center gap-2"
          style={{ textDecoration: "none" }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontSize: "14px",
              fontWeight: 400,
            }}
          >
            S
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "15px",
              color: "var(--text-primary)",
              fontWeight: 400,
              letterSpacing: "0.02em",
            }}
          >
            STANDUPAI
          </span>
        </Link>
      </div>

      <Separator className="mb-4" />

      {/* Team Selector */}
      {teams.length > 0 && (
        <div className="relative mb-6 px-3">
          <button
            onClick={() => setSelectorOpen(!selectorOpen)}
            className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-[var(--surface-2)]"
            style={{ background: "var(--surface)", cursor: "pointer" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                  }}
                >
                  {activeTeam?.teamName ?? "Select team"}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    color: "var(--text-tertiary)",
                    marginTop: "2px",
                    textTransform: "capitalize",
                  }}
                >
                  {activeTeam?.role ?? ""}
                </p>
              </div>
              {teams.length > 1 && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    selectorOpen && "rotate-180",
                  )}
                  style={{ color: "var(--text-tertiary)" }}
                />
              )}
            </div>
          </button>

          {selectorOpen && teams.length > 1 && (
            <div
              className="absolute left-3 right-3 top-full z-10 mt-1 rounded-lg border shadow-lg"
              style={{ background: "var(--surface)" }}
            >
              {teams.map((team) => (
                <button
                  key={team.teamId}
                  onClick={() => switchTeam(team.teamId)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-[var(--surface-2)]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 500 }}>{team.teamName}</p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--text-tertiary)",
                        textTransform: "capitalize",
                      }}
                    >
                      {team.role}
                    </p>
                  </div>
                  {team.teamId === activeTeamId && (
                    <Check className="h-4 w-4" style={{ color: "var(--green)" }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={buildHref(item.href)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="mt-auto">
        <Separator className="mb-4" />
        <div className="flex items-center gap-3 px-3 py-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: { width: "32px", height: "32px" },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
