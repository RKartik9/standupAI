"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame } from "lucide-react";

interface StreakData {
  userId: string;
  name: string;
  image: string | null;
  streak: number;
  totalDays: number;
}

interface StreakBoardProps {
  streaks: StreakData[];
}

export function StreakBoard({ streaks }: StreakBoardProps) {
  if (streaks.length === 0) {
    return (
      <div
        className="flex items-center justify-center py-12"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-small)",
          color: "var(--text-tertiary)",
        }}
      >
        No activity yet this week
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {streaks.map((member, i) => {
        const initials = member.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <motion.div
            key={member.userId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between"
            style={{
              padding: "12px 16px",
              background: i === 0 ? "var(--surface-2)" : "transparent",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-5 text-center"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "14px",
                  color:
                    i === 0
                      ? "var(--text-primary)"
                      : "var(--text-tertiary)",
                }}
              >
                {i + 1}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                  }}
                >
                  {member.name}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    color: "var(--text-tertiary)",
                  }}
                >
                  {member.totalDays}/7 days active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {member.streak > 0 && (
                <Flame
                  size={14}
                  style={{
                    color:
                      member.streak >= 5
                        ? "var(--red)"
                        : member.streak >= 3
                          ? "var(--amber)"
                          : "var(--text-tertiary)",
                  }}
                />
              )}
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "18px",
                  color: "var(--text-primary)",
                }}
              >
                {member.streak}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  color: "var(--text-tertiary)",
                }}
              >
                day{member.streak !== 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
