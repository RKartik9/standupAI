"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function AISummaryPanel() {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Insights
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Smart summaries and team insights
        </p>
      </div>

      <Button className="w-full mb-6" size="lg">
        <Sparkles className="mr-2 h-4 w-4" />
        Summarize Today
      </Button>

      <Separator className="mb-6" />

      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base">No Summary Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click "Summarize Today" to generate AI-powered insights from
              today's updates.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
