"use client";

import { motion } from "framer-motion";
import { FileText, Users, AlertCircle, Activity } from "lucide-react";
import Link from "next/link";

interface TeamPulseProps {
  stats: {
    todayUpdates: number;
    totalMembers: number;
    participation: number;
    todayBlockers: number;
    weeklyTotal: number;
  };
}

export function TeamPulse({ stats }: TeamPulseProps) {
  const pulseColor =
    stats.participation >= 80
      ? "var(--green)"
      : stats.participation >= 50
        ? "var(--amber)"
        : "var(--red)";

  const items = [
    {
      icon: FileText,
      value: stats.todayUpdates,
      label: "updates today",
    },
    {
      icon: Users,
      value: `${stats.participation}%`,
      label: "participation",
    },
    {
      icon: AlertCircle,
      value: stats.todayBlockers,
      label: "blockers",
    },
    {
      icon: Activity,
      value: stats.weeklyTotal,
      label: "this week",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link
        href="/dashboard/analytics"
        className="block transition-all hover:shadow-md"
        style={{
          textDecoration: "none",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: "16px 24px",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Pulse indicator */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: pulseColor }}
                />
                <div
                  className="absolute inset-0 animate-ping rounded-full opacity-40"
                  style={{ background: pulseColor }}
                />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  letterSpacing: "0.02em",
                }}
              >
                TEAM PULSE
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-5">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <item.icon
                    size={13}
                    strokeWidth={1.5}
                    style={{ color: "var(--text-tertiary)" }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                    }}
                  >
                    {item.value}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "12px",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "var(--text-tertiary)",
            }}
          >
            View analytics →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
