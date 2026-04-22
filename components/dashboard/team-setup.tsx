"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createTeam } from "@/lib/actions/teams";
import {
  createTeamSchema,
  type CreateTeamInput,
} from "@/lib/validations/teams";

export function TeamSetup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
  });

  const onSubmit = async (data: CreateTeamInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createTeam(data);
      if (result.error) {
        setError("Failed to create team. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          CREATE YOUR TEAM
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "16px",
            color: "var(--text-secondary)",
          }}
        >
          Set up your first team to start posting async standups
        </p>
      </div>

      <Card className="border-2">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="name">Team name</Label>
              <Input
                id="name"
                placeholder="e.g. Engineering, Design, Marketing"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Team"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
