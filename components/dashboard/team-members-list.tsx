"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { removeOrgMember, changeOrgMemberRole } from "@/lib/actions/organizations";
import { setMemberTeams } from "@/lib/actions/teams";
import { UserMinus, Shield, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberRow {
  id: string;
  userId: string;
  role: string;
  joinedAt: Date;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  teamIds: string[];
}

interface TeamMembersListProps {
  members: MemberRow[];
  teams: { id: string; name: string }[];
  organizationId: string;
  isAdmin: boolean;
  currentUserId: string;
}

export function TeamMembersList({
  members,
  teams,
  organizationId,
  isAdmin,
  currentUserId,
}: TeamMembersListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRemove = async (memberId: string) => {
    if (!confirm("Remove this person from the workspace?")) return;
    setLoading(memberId);
    setError(null);
    try {
      const res = await removeOrgMember(organizationId, memberId);
      if (res.error) setError(res.error);
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const handleRoleChange = async (memberId: string, currentRole: string) => {
    setLoading(memberId);
    setError(null);
    try {
      const newRole = currentRole === "admin" ? "member" : "admin";
      const res = await changeOrgMemberRole(organizationId, memberId, newRole);
      if (res.error) setError(res.error);
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const toggleTeam = async (member: MemberRow, teamId: string) => {
    setLoading(member.userId);
    setError(null);
    try {
      const next = member.teamIds.includes(teamId)
        ? member.teamIds.filter((id) => id !== teamId)
        : [...member.teamIds, teamId];
      const res = await setMemberTeams(organizationId, member.userId, next);
      if (res.error) setError(res.error);
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const name =
          `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() ||
          member.email ||
          "Unknown";
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        const isCurrentUser = member.userId === currentUserId;
        const memberTeams = teams.filter((t) => member.teamIds.includes(t.id));

        return (
          <Card key={member.id}>
            <CardContent className="space-y-3 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.imageUrl ?? undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {name}
                        {isCurrentUser && (
                          <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                        )}
                      </p>
                      <Badge
                        variant={member.role === "admin" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {member.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>

                {isAdmin && !isCurrentUser && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRoleChange(member.userId, member.role)}
                      disabled={loading === member.userId}
                      title={member.role === "admin" ? "Demote to member" : "Promote to admin"}
                    >
                      {member.role === "admin" ? (
                        <ShieldOff className="h-4 w-4" />
                      ) : (
                        <Shield className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(member.userId)}
                      disabled={loading === member.userId}
                      title="Remove from workspace"
                      className="text-destructive hover:text-destructive"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Team assignment */}
              {teams.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pl-[52px]">
                  <span className="mr-1 text-[11px] text-muted-foreground">Teams:</span>
                  {isAdmin
                    ? teams.map((t) => {
                        const on = member.teamIds.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            disabled={loading === member.userId}
                            onClick={() => toggleTeam(member, t.id)}
                            className={cn(
                              "rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
                              on ? "border-transparent" : "hover:bg-[var(--surface-2)]",
                            )}
                            style={{
                              fontFamily: "var(--font-body)",
                              background: on ? "var(--accent)" : "var(--surface)",
                              color: on ? "#fff" : "var(--text-secondary)",
                              cursor: "pointer",
                            }}
                            title={on ? `Remove from ${t.name}` : `Add to ${t.name}`}
                          >
                            {t.name}
                          </button>
                        );
                      })
                    : memberTeams.length > 0
                      ? memberTeams.map((t) => (
                          <Badge key={t.id} variant="secondary" className="text-[11px]">
                            {t.name}
                          </Badge>
                        ))
                      : (
                          <span className="text-[11px] text-muted-foreground">none</span>
                        )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
