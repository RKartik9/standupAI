"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createUpdate } from "@/lib/actions/updates";
import {
  createUpdateSchema,
  type CreateUpdateInput,
} from "@/lib/validations/updates";

interface StandupFormProps {
  teamId: string;
}

export function StandupForm({ teamId }: StandupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUpdateInput>({
    resolver: zodResolver(createUpdateSchema),
  });

  const onSubmit = async (data: CreateUpdateInput) => {
    setIsSubmitting(true);
    setSubmitMessage(null);
    try {
      const result = await createUpdate(teamId, data);
      if (result.error) {
        setSubmitMessage("Failed to post update. Please try again.");
        return;
      }
      reset();
      setSubmitMessage("Update posted!");
      setTimeout(() => setSubmitMessage(null), 3000);
    } catch {
      setSubmitMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="did">What did you do today?</Label>
            <Textarea
              id="did"
              placeholder="Share your progress..."
              className="min-h-[80px] resize-none"
              {...register("did")}
              onKeyDown={handleKeyDown}
            />
            {errors.did && (
              <p className="text-sm text-destructive">{errors.did.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="willDo">What will you do next?</Label>
            <Textarea
              id="willDo"
              placeholder="Share your plans..."
              className="min-h-[80px] resize-none"
              {...register("willDo")}
              onKeyDown={handleKeyDown}
            />
            {errors.willDo && (
              <p className="text-sm text-destructive">
                {errors.willDo.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="blockers">Any blockers? (Optional)</Label>
            <Textarea
              id="blockers"
              placeholder="Share any blockers or challenges..."
              className="min-h-[80px] resize-none"
              {...register("blockers")}
              onKeyDown={handleKeyDown}
            />
            {errors.blockers && (
              <p className="text-sm text-destructive">
                {errors.blockers.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground">
                Press ⌘ + Enter to submit
              </p>
              {submitMessage && (
                <p className="text-xs text-green-600">{submitMessage}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting ? "Posting..." : "Post Update"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
