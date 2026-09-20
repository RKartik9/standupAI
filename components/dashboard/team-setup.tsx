"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createOrganization } from "@/lib/actions/organizations";
import {
  createOrganizationSchema,
  type CreateOrganizationInput,
} from "@/lib/validations/organizations";

/** First-run screen: create the customer's workspace (one per license). */
export function TeamSetup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
  });

  const onSubmit = async (data: CreateOrganizationInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
      const result = await createOrganization({ name: data.name, timezone });
      if (result.error) {
        setError(
          result.error.name?.[0] ?? "Failed to create workspace. Please try again.",
        );
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
          CREATE YOUR WORKSPACE
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "16px",
            color: "var(--text-secondary)",
          }}
        >
          Your license covers one company workspace. You&apos;ll add teams,
          invite people and set your working hours next.
        </p>
      </div>

      <Card className="border-2">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="name">Company or workspace name</Label>
              <Input
                id="name"
                placeholder="e.g. Acme Inc."
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Workspace"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            Been invited?{" "}
            <Link href="/dashboard/join" className="underline">
              Join with an invite code
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
