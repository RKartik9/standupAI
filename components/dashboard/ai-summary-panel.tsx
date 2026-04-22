"use client";

import { useState } from "react";
import { Sparkles, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { generateSummary } from "@/lib/actions/ai";
import type { AISummary } from "@/lib/db/schema";

interface AISummaryPanelProps {
  teamId: string;
  summary: AISummary | null;
}

interface Insight {
  type: "warning" | "info" | "success";
  message: string;
}

interface ParsedSummary {
  progress: string[];
  blockers: string[];
  priorities: string[];
  insights?: Insight[];
  teamHealth: string;
}

function parseSummary(summary: AISummary | null): ParsedSummary | null {
  if (!summary) return null;
  try {
    return JSON.parse(summary.summary) as ParsedSummary;
  } catch {
    return null;
  }
}

const insightIcons = {
  warning: <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--amber)" }} />,
  info: <Info className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--blue)" }} />,
  success: <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--green)" }} />,
};

const insightBg = {
  warning: "var(--amber-surface)",
  info: "#eff6ff",
  success: "var(--green-surface)",
};

export function AISummaryPanel({ teamId, summary }: AISummaryPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<AISummary | null>(
    summary,
  );
  const [error, setError] = useState<string | null>(null);

  const parsed = parseSummary(currentSummary);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateSummary(teamId);
      if ("error" in result) {
        setError(result.error as string);
      } else if (result.data) {
        setCurrentSummary(result.data);
      }
    } catch {
      setError("Failed to generate summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-5 w-5" />
          AI Insights
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Smart summaries and team insights
        </p>
      </div>

      <Button
        className="mb-6 w-full"
        size="lg"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {isGenerating ? "Generating..." : "Summarize Today"}
      </Button>

      <Separator className="mb-6" />

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {parsed ? (
        <div className="flex-1 space-y-5 overflow-auto">
          {/* Smart Insights */}
          {parsed.insights && parsed.insights.length > 0 && (
            <div className="space-y-2">
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-label)",
                  color: "var(--text-tertiary)",
                  letterSpacing: "0.08em",
                }}
              >
                SMART INSIGHTS
              </h3>
              {parsed.insights.map((insight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-md p-2.5"
                  style={{ background: insightBg[insight.type] }}
                >
                  {insightIcons[insight.type]}
                  <span className="text-xs leading-relaxed">
                    {insight.message}
                  </span>
                </div>
              ))}
              <Separator />
            </div>
          )}

          {parsed.progress.length > 0 && (
            <div>
              <h3
                className="mb-2"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-label)",
                  color: "var(--text-tertiary)",
                  letterSpacing: "0.08em",
                }}
              >
                PROGRESS
              </h3>
              <ul className="space-y-1.5">
                {parsed.progress.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <div
                      className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ background: "var(--green)" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {parsed.blockers.length > 0 && (
            <>
              <Separator />
              <div>
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-label)",
                    color: "var(--text-tertiary)",
                    letterSpacing: "0.08em",
                  }}
                >
                  BLOCKERS
                </h3>
                <ul className="space-y-1.5">
                  {parsed.blockers.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <div
                        className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ background: "var(--red)" }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {parsed.priorities.length > 0 && (
            <>
              <Separator />
              <div>
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-label)",
                    color: "var(--text-tertiary)",
                    letterSpacing: "0.08em",
                  }}
                >
                  PRIORITIES
                </h3>
                <ul className="space-y-1.5">
                  {parsed.priorities.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <div
                        className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ background: "var(--blue)" }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {parsed.teamHealth && (
            <>
              <Separator />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Team health:
                </span>
                <span
                  className="text-xs font-medium capitalize"
                  style={{
                    color:
                      parsed.teamHealth === "great"
                        ? "var(--green)"
                        : parsed.teamHealth === "good"
                          ? "var(--blue)"
                          : "var(--amber)",
                  }}
                >
                  {parsed.teamHealth}
                </span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
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
      )}
    </div>
  );
}
