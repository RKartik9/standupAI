"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { joinTeamByCode } from "@/lib/actions/invites";

interface JoinTeamFormProps {
  code: string;
}

export function JoinTeamForm({ code: initialCode }: JoinTeamFormProps) {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleJoin = async () => {
    if (!code.trim()) {
      setError("Please enter an invite code");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await joinTeamByCode(code.trim());
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 text-center">
      <div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-h1)",
            color: "var(--text-primary)",
            fontWeight: 400,
            marginBottom: "12px",
          }}
        >
          JOIN A TEAM
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "16px",
            color: "var(--text-secondary)",
          }}
        >
          Enter the invite code to join your team
        </p>
      </div>

      <Card className="border-2">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2 text-left">
            <Label htmlFor="code">Invite code</Label>
            <Input
              id="code"
              placeholder="Paste invite code..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={handleJoin}
            disabled={loading}
          >
            {loading ? "Joining..." : "Join Team"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
