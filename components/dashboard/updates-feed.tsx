"use client";

import { UpdateCard } from "./update-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockUpdates = [
  {
    id: "1",
    userName: "John Doe",
    did: "Fixed the authentication bug that was preventing users from logging in. Implemented proper error handling and added tests.",
    willDo: "Start working on the dashboard redesign. Will focus on the sidebar navigation first.",
    blockers: "Waiting for API documentation from the backend team",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "2",
    userName: "Jane Smith",
    did: "Completed the user profile page with all CRUD operations. Added form validation using Zod.",
    willDo: "Integrate the real-time notifications feature using Pusher. Will pair with John on the dashboard.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "3",
    userName: "Alex Johnson",
    did: "Set up CI/CD pipeline with GitHub Actions. All tests now run automatically on PR creation.",
    willDo: "Work on database migration scripts and setup staging environment.",
    blockers: "Need AWS credentials for staging deployment",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
];

export function UpdatesFeed() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Today's Updates</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mockUpdates.length} updates from your team
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {mockUpdates.length > 0 ? (
          mockUpdates.map((update) => (
            <UpdateCard key={update.id} update={update} />
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Updates Yet</CardTitle>
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
