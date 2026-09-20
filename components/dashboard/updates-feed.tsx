"use client";

import { useEffect, useState } from "react";
import { UpdateCard } from "./update-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPusherClient } from "@/lib/pusher/client";
import type { Update } from "@/lib/db/schema";

interface UpdatesFeedProps {
  updates: Update[];
  organizationId: string;
}

export function UpdatesFeed({ updates: initial, organizationId }: UpdatesFeedProps) {
  const [updates, setUpdates] = useState<Update[]>(initial);

  useEffect(() => {
    setUpdates(initial);
  }, [initial]);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`org-${organizationId}`);

    channel.bind("new-update", (data: Update) => {
      setUpdates((prev) => {
        if (prev.some((u) => u.id === data.id)) return prev;
        return [data, ...prev];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`org-${organizationId}`);
    };
  }, [organizationId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h3)",
              color: "var(--text-primary)",
              fontWeight: 400,
              letterSpacing: "0.02em",
            }}
          >
            TODAY'S UPDATES
          </h2>
          <p
            className="mt-1"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-small)",
              color: "var(--text-secondary)",
            }}
          >
            {updates.length} update{updates.length !== 1 ? "s" : ""} from
            your team
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              color: "var(--text-tertiary)",
            }}
          >
            Live
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {updates.length > 0 ? (
          updates.map((update) => (
            <UpdateCard key={update.id} update={update} />
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No Updates Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Be the first to post a standup update today!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
