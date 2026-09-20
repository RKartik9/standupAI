"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  leaveOrganization,
  updateOrganizationName,
} from "@/lib/actions/organizations";
import type { SerializedCalendar } from "@/lib/scheduling/org-calendar";
import {
  WorkingCalendarSettings,
  type HolidayRow,
} from "./working-calendar-settings";

interface SettingsPanelProps {
  organizationId: string;
  organizationName: string;
  isAdmin: boolean;
  calendar: SerializedCalendar;
  holidays: HolidayRow[];
}

export function SettingsPanel({
  organizationId,
  organizationName,
  isAdmin,
  calendar,
  holidays,
}: SettingsPanelProps) {
  const [name, setName] = useState(organizationName);
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
      const result = await updateOrganizationName(organizationId, name);
      if (result.error) {
        setError("Failed to update workspace name");
      } else {
        setMessage("Workspace name updated");
        setTimeout(() => setMessage(null), 3000);
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this workspace?")) return;
    setLeaving(true);
    setError(null);
    try {
      const result = await leaveOrganization(organizationId);
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
            <CardTitle className="text-base">Workspace Name</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Name</Label>
              <Input
                id="orgName"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={saving || name === organizationName}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
              {message && <p className="text-sm text-green-600">{message}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      <WorkingCalendarSettings
        organizationId={organizationId}
        calendar={calendar}
        holidays={holidays}
        isAdmin={isAdmin}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Leave Workspace</p>
              <p className="text-xs text-muted-foreground">
                You will lose access to this workspace&apos;s projects and updates
              </p>
            </div>
            <Button variant="destructive" onClick={handleLeave} disabled={leaving}>
              {leaving ? "Leaving..." : "Leave Workspace"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
