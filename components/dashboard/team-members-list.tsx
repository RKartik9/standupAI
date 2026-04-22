"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { removeMember, changeMemberRole } from "@/lib/actions/teams";
import { UserMinus, Shield, ShieldOff } from "lucide-react";

interface MemberRow {
  id: string;
  userId: string;
  role: string;
  joinedAt: Date;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

interface TeamMembersListProps {
  members: MemberRow[];
  teamId: string;
  isAdmin: boolean;
  currentUserId: string;
}

export function TeamMembersList({
  members,
  teamId,
  isAdmin,
  currentUserId,
}: TeamMembersListProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleRemove = async (memberId: string) => {
    setLoading(memberId);
    try {
      await removeMember(teamId, memberId);
    } finally {
      setLoading(null);
    }
  };

  const handleRoleChange = async (memberId: string, currentRole: string) => {
    setLoading(memberId);
    try {
      const newRole = currentRole === "admin" ? "member" : "admin";
      await changeMemberRole(teamId, memberId, newRole);
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

        return (
          <Card key={member.id}>
            <CardContent className="flex items-center justify-between py-4">
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
                        <span className="ml-1 text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </p>
                    <Badge
                      variant={
                        member.role === "admin" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {member.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </div>

              {isAdmin && !isCurrentUser && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleRoleChange(member.userId, member.role)
                    }
                    disabled={loading === member.userId}
                    title={
                      member.role === "admin"
                        ? "Demote to member"
                        : "Promote to admin"
                    }
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
                    title="Remove member"
                    className="text-destructive hover:text-destructive"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
