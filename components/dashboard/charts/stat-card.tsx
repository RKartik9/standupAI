"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  color: string;
  trend?: { value: string; positive: boolean };
}

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  color,
  trend,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        padding: "24px",
      }}
    >
      <div
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: `${color}10` }}
      >
        <Icon size={20} strokeWidth={1.5} style={{ color }} />
      </div>

      <div>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-label)",
            color: "var(--text-tertiary)",
            letterSpacing: "0.08em",
            marginBottom: "8px",
          }}
        >
          {label.toUpperCase()}
        </p>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "36px",
            color: "var(--text-primary)",
            fontWeight: 400,
            lineHeight: 1.1,
          }}
        >
          {value}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {trend && (
            <span
              className="rounded-md px-1.5 py-0.5"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                fontWeight: 500,
                color: trend.positive ? "var(--green)" : "var(--red)",
                background: trend.positive
                  ? "var(--green-surface)"
                  : "var(--red-surface)",
              }}
            >
              {trend.value}
            </span>
          )}
          {sublabel && (
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                color: "var(--text-tertiary)",
              }}
            >
              {sublabel}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
