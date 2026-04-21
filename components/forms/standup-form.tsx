"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const standupSchema = z.object({
  did: z.string().min(1, "Please share what you did").max(500),
  willDo: z.string().min(1, "Please share what you'll do next").max(500),
  blockers: z.string().max(500).optional(),
});

type StandupFormData = z.infer<typeof standupSchema>;

export function StandupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StandupFormData>({
    resolver: zodResolver(standupSchema),
  });

  const onSubmit = async (data: StandupFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Standup update:", data);
      reset();
    } catch (error) {
      console.error("Error submitting update:", error);
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
            <p className="text-xs text-muted-foreground">
              Press ⌘ + Enter to submit
            </p>
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting ? "Posting..." : "Post Update"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
