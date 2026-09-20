"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Check, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createTeam, renameTeam, setTeamArchived } from "@/lib/actions/teams";

export type TeamRow = {
  id: string;
  name: string;
  archived: boolean;
  memberCount: number;
};

interface TeamsManagerProps {
  organizationId: string;
  teams: TeamRow[];
  isAdmin: boolean;
}

export function TeamsManager({ organizationId, teams, isAdmin }: TeamsManagerProps) {
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const router = useRouter();

  const visible = teams.filter((t) => showArchived || !t.archived);
  const archivedCount = teams.filter((t) => t.archived).length;

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setBusy("new");
    setError(null);
    try {
      const res = await createTeam(organizationId, { name: newName.trim() });
      if (res.error) {
        setError(res.error.name?.[0] ?? "Could not create team");
      } else {
        setNewName("");
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  };

  const handleRename = async (teamId: string) => {
    if (!editName.trim()) return;
    setBusy(teamId);
    setError(null);
    try {
      const res = await renameTeam(teamId, editName.trim());
      if (res.error) {
        setError(res.error.name?.[0] ?? "Could not rename team");
      } else {
        setEditing(null);
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  };

  const handleArchive = async (teamId: string, archived: boolean) => {
    setBusy(teamId);
    setError(null);
    try {
      await setTeamArchived(teamId, archived);
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Teams</CardTitle>
        {archivedCount > 0 && (
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            {showArchived ? "Hide" : "Show"} {archivedCount} archived
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "No teams yet. Create the groups your company works in — any names you like."
              : "No teams have been created yet."}
          </p>
        )}

        {visible.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
            style={{ background: "var(--surface)", opacity: t.archived ? 0.6 : 1 }}
          >
            {editing === t.id ? (
              <div className="flex flex-1 items-center gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-8"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(t.id);
                    if (e.key === "Escape") setEditing(null);
                  }}
                />
                <Button size="icon" variant="ghost" onClick={() => handleRename(t.id)} disabled={busy === t.id}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setEditing(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{t.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {t.memberCount} member{t.memberCount !== 1 ? "s" : ""}
                  </Badge>
                  {t.archived && (
                    <Badge variant="outline" className="text-xs">
                      archived
                    </Badge>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Rename"
                      onClick={() => {
                        setEditing(t.id);
                        setEditName(t.name);
                      }}
                      disabled={busy === t.id}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title={t.archived ? "Restore" : "Archive"}
                      onClick={() => handleArchive(t.id, !t.archived)}
                      disabled={busy === t.id}
                    >
                      {t.archived ? (
                        <ArchiveRestore className="h-4 w-4" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {isAdmin && (
          <div className="flex items-center gap-2 pt-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New team name, e.g. Engineering, Design, Client Success"
              className="h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
            <Button onClick={handleCreate} disabled={busy === "new" || !newName.trim()}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
