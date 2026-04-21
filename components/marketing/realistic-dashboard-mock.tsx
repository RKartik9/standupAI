"use client";

import { Home, Users, Settings, Sparkles, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const updates = [
  {
    id: 1,
    name: "Sarah Chen",
    initials: "SC",
    time: "2h ago",
    did: "Completed user authentication flow and integrated with backend API",
    willDo: "Starting work on the dashboard analytics page",
    blocker: null,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    initials: "MJ",
    time: "4h ago",
    did: "Fixed critical bug in payment processing, deployed to production",
    willDo: "Code review for Sarah's PR, then working on API optimization",
    blocker: "Waiting for design assets for the new onboarding flow",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    initials: "ER",
    time: "5h ago",
    did: "Completed mobile responsive design for landing page",
    willDo: "Working on component library documentation",
    blocker: null,
  },
];

export function RealisticDashboardMock() {
  return (
    <div className="relative">
      {/* Main Dashboard Container */}
      <div className="border rounded-lg shadow-2xl overflow-hidden bg-background">
        <div className="flex h-[600px]">
          {/* Left Sidebar */}
          <div className="w-56 border-r bg-muted/30 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center text-background text-sm font-bold">
                  S
                </div>
                <span className="font-semibold text-sm">StandupAI</span>
              </div>
            </div>

            <div className="p-3 border-b">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                TEAM
              </div>
              <div className="bg-muted rounded-md p-2 text-sm">
                <div className="font-medium">Engineering</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  8 members
                </div>
              </div>
            </div>

            <nav className="flex-1 p-3 space-y-1">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted text-sm font-medium">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted/50">
                <Users className="h-4 w-4" />
                <span>Team</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted/50">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </div>
            </nav>

            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  JD
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">John Doe</div>
                  <div className="text-xs text-muted-foreground truncate">
                    Admin
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Feed */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Today's Updates</h2>
              <p className="text-sm text-muted-foreground">
                {updates.length} updates from your team
              </p>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3">
              {updates.map((update) => (
                <Card key={update.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-muted">
                        {update.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">
                          {update.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {update.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        ✓ Completed
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {update.did}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        → Next Up
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {update.willDo}
                      </p>
                    </div>

                    {update.blocker && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <AlertCircle className="h-3 w-3 text-orange-500" />
                          <span className="text-xs font-medium text-orange-600 dark:text-orange-500">
                            Blocker
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {update.blocker}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Panel - AI Summary */}
          <div className="w-72 border-l bg-muted/30 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4" />
                <h3 className="font-semibold text-sm">AI Summary</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Generated from today's updates
              </p>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div>
                <div className="text-xs font-medium mb-2">Progress</div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="leading-relaxed">
                    • Authentication flow completed
                  </li>
                  <li className="leading-relaxed">
                    • Payment bug fixed and deployed
                  </li>
                  <li className="leading-relaxed">
                    • Mobile design finished
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  Blockers
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="leading-relaxed">
                    • 1 team member waiting on design assets
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <div className="text-xs font-medium mb-2">Priorities</div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="leading-relaxed">
                    • API optimization in progress
                  </li>
                  <li className="leading-relaxed">
                    • Dashboard analytics starting
                  </li>
                </ul>
              </div>

              <Button size="sm" className="w-full mt-4" variant="outline">
                View Full Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle indicator */}
      <div className="absolute -bottom-2 -right-2 bg-background border rounded-md px-2 py-1 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>
    </div>
  );
}
