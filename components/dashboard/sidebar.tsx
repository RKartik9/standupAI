"use client";

import {
  Home,
  Users,
  Settings,
  ChevronDown,
  Check,
  BarChart3,
  FolderKanban,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export interface OrgInfo {
  organizationId: string;
  name: string;
  role: string;
}

interface SidebarProps {
  orgs: OrgInfo[];
  activeOrgId: string | null;
}

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home, exact: true },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ orgs, activeOrgId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const activeOrg = orgs.find((o) => o.organizationId === activeOrgId);

  const switchOrg = (organizationId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("orgId", organizationId);
    // Project detail pages belong to one org; fall back to the list.
    const base = pathname.startsWith("/dashboard/projects/")
      ? "/dashboard/projects"
      : pathname;
    router.push(`${base}?${params.toString()}`);
    setSelectorOpen(false);
  };

  const buildHref = (base: string) => {
    if (activeOrgId) return `${base}?orgId=${activeOrgId}`;
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

      {/* Workspace selector */}
      {orgs.length > 0 && (
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
                  {activeOrg?.name ?? "Select workspace"}
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
                  {activeOrg?.role ?? ""}
                </p>
              </div>
              {orgs.length > 1 && (
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

          {selectorOpen && orgs.length > 1 && (
            <div
              className="absolute left-3 right-3 top-full z-10 mt-1 rounded-lg border shadow-lg"
              style={{ background: "var(--surface)" }}
            >
              {orgs.map((org) => (
                <button
                  key={org.organizationId}
                  onClick={() => switchOrg(org.organizationId)}
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
                    <p style={{ fontWeight: 500 }}>{org.name}</p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--text-tertiary)",
                        textTransform: "capitalize",
                      }}
                    >
                      {org.role}
                    </p>
                  </div>
                  {org.organizationId === activeOrgId && (
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
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
