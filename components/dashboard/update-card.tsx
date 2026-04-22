"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { Update } from "@/lib/db/schema";

interface UpdateCardProps {
  update: Update;
}

export function UpdateCard({ update }: UpdateCardProps) {
  const initials = update.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={update.userImage ?? undefined} />
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

        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
              ✅ Completed
            </h4>
            <p className="text-sm">{update.did}</p>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
              🎯 Next Up
            </h4>
            <p className="text-sm">{update.willDo}</p>
          </div>

          {update.blockers && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-destructive">
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
