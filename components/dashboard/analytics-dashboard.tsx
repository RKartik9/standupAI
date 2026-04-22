"use client";

import {
  FileText,
  Users,
  Target,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { ActivityChart } from "./charts/activity-chart";
import { MemberChart } from "./charts/member-chart";
import { StatCard } from "./charts/stat-card";
import { StreakBoard } from "./charts/streak-board";

interface AnalyticsData {
  dailyChart: { day: string; updates: number; blockers: number }[];
  memberActivity: { name: string; image: string | null; updates: number }[];
  streaks: {
    userId: string;
    name: string;
    image: string | null;
    streak: number;
    totalDays: number;
  }[];
  stats: {
    todayUpdates: number;
    totalMembers: number;
    participation: number;
    todayBlockers: number;
    weeklyTotal: number;
  };
}

interface AnalyticsDashboardProps {
  analytics: AnalyticsData;
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const { dailyChart, memberActivity, streaks, stats } = analytics;

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's Updates"
          value={stats.todayUpdates}
          sublabel="posted today"
          icon={FileText}
          color="var(--text-primary)"
        />
        <StatCard
          label="Participation"
          value={`${stats.participation}%`}
          sublabel={`of ${stats.totalMembers} members`}
          icon={Users}
          color="var(--blue)"
          trend={
            stats.participation >= 80
              ? { value: "Strong", positive: true }
              : stats.participation >= 50
                ? { value: "Moderate", positive: true }
                : { value: "Low", positive: false }
          }
        />
        <StatCard
          label="Weekly Total"
          value={stats.weeklyTotal}
          sublabel="last 7 days"
          icon={TrendingUp}
          color="var(--green)"
        />
        <StatCard
          label="Active Blockers"
          value={stats.todayBlockers}
          sublabel="reported today"
          icon={AlertCircle}
          color="var(--red)"
          trend={
            stats.todayBlockers === 0
              ? { value: "Clear", positive: true }
              : { value: "Needs attention", positive: false }
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Activity */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: "24px",
          }}
        >
          <div className="mb-6">
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-h3)",
                color: "var(--text-primary)",
                fontWeight: 400,
                letterSpacing: "0.02em",
              }}
            >
              DAILY ACTIVITY
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-small)",
                color: "var(--text-tertiary)",
                marginTop: "2px",
              }}
            >
              Updates and blockers per day
            </p>
          </div>
          <ActivityChart data={dailyChart} />
        </div>

        {/* Member Contributions */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: "24px",
          }}
        >
          <div className="mb-6">
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-h3)",
                color: "var(--text-primary)",
                fontWeight: 400,
                letterSpacing: "0.02em",
              }}
            >
              TEAM CONTRIBUTIONS
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-small)",
                color: "var(--text-tertiary)",
                marginTop: "2px",
              }}
            >
              Updates per member (30 days)
            </p>
          </div>
          {memberActivity.length > 0 ? (
            <MemberChart data={memberActivity} />
          ) : (
            <div
              className="flex items-center justify-center py-20"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-small)",
                color: "var(--text-tertiary)",
              }}
            >
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Streaks */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: "24px",
        }}
      >
        <div className="mb-4">
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h3)",
              color: "var(--text-primary)",
              fontWeight: 400,
              letterSpacing: "0.02em",
            }}
          >
            CONSISTENCY STREAKS
          </h3>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-small)",
              color: "var(--text-tertiary)",
              marginTop: "2px",
            }}
          >
            Consecutive days of posting updates
          </p>
        </div>
        <StreakBoard streaks={streaks} />
      </div>
    </div>
  );
}
