"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check, Copy } from "lucide-react";
import { createInviteLink } from "@/lib/actions/invites";

interface InviteLinkProps {
  organizationId: string;
}

export function InviteLink({ organizationId }: InviteLinkProps) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const invite = await createInviteLink(organizationId);
      const url = `${window.location.origin}/dashboard/join?code=${invite.code}`;
      setInviteUrl(url);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inviteUrl) {
    return (
      <div className="flex items-center gap-2">
        <code className="max-w-[200px] truncate rounded border bg-muted px-2 py-1 text-xs">
          {inviteUrl}
        </code>
        <Button variant="outline" size="icon" onClick={handleCopy}>
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" onClick={handleGenerate} disabled={loading}>
      <Link2 className="mr-2 h-4 w-4" />
      {loading ? "Generating..." : "Invite People"}
    </Button>
  );
}
