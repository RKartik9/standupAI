"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface UpdateCardProps {
  update: {
    id: string;
    userName: string;
    userAvatar?: string;
    did: string;
    willDo: string;
    blockers?: string;
    createdAt: Date;
  };
}

export function UpdateCard({ update }: UpdateCardProps) {
  const initials = update.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={update.userAvatar} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{update.userName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(update.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              ✅ Completed
            </h4>
            <p className="text-sm">{update.did}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              🎯 Next Up
            </h4>
            <p className="text-sm">{update.willDo}</p>
          </div>

          {update.blockers && (
            <div>
              <h4 className="text-sm font-semibold text-destructive mb-2">
                🚧 Blockers
              </h4>
              <div className="flex gap-2">
                <Badge variant="destructive">Blocked</Badge>
                <p className="text-sm">{update.blockers}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
