"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateTeamName, leaveTeam } from "@/lib/actions/teams";

interface SettingsPanelProps {
  teamId: string;
  teamName: string;
  isAdmin: boolean;
}

export function SettingsPanel({
  teamId,
  teamName,
  isAdmin,
}: SettingsPanelProps) {
  const [name, setName] = useState(teamName);
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const result = await updateTeamName(teamId, name);
      if (result.error) {
        setError("Failed to update team name");
      } else {
        setMessage("Team name updated");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this team?")) return;
    setLeaving(true);
    setError(null);
    try {
      const result = await leaveTeam(teamId);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Name</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Name</Label>
              <Input
                id="teamName"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving || name === teamName}>
                {saving ? "Saving..." : "Save"}
              </Button>
              {message && (
                <p className="text-sm text-green-600">{message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Leave Team</p>
              <p className="text-xs text-muted-foreground">
                You will lose access to this team's updates and data
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleLeave}
              disabled={leaving}
            >
              {leaving ? "Leaving..." : "Leave Team"}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
