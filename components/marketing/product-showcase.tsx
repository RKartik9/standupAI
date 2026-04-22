"use client";

import { motion } from "framer-motion";
import { MessageSquare, Sparkles, BarChart, AlertCircle } from "lucide-react";
import { useState } from "react";

const tabs = [
  { id: "feed", label: "Feed", icon: MessageSquare },
  { id: "insights", label: "AI Insights", icon: Sparkles },
  { id: "analytics", label: "Analytics", icon: BarChart },
] as const;

type TabId = (typeof tabs)[number]["id"];

const feedItems = [
  {
    name: "Sarah Chen",
    initials: "SC",
    time: "2h ago",
    team: "Engineering",
    done: "Completed authentication flow redesign",
    next: "Working on API integration",
    blocker: null,
  },
  {
    name: "Marcus Johnson",
    initials: "MJ",
    time: "3h ago",
    team: "Engineering",
    done: "Fixed payment processing bug and deployed hotfix",
    next: "Code review for Sarah's PR",
    blocker: "Waiting on design assets for onboarding",
  },
  {
    name: "Emily Rodriguez",
    initials: "ER",
    time: "5h ago",
    team: "Design",
    done: "Finalized mobile responsive layouts for dashboard",
    next: "Component library documentation",
    blocker: null,
  },
];

const insights = [
  {
    type: "momentum",
    color: "var(--green)",
    bg: "var(--green-surface)",
    title: "High momentum in frontend",
    description:
      "3 team members shipped UI features today. Great progress on the sprint.",
  },
  {
    type: "blocker",
    color: "var(--amber)",
    bg: "var(--amber-surface)",
    title: "Potential blocker detected",
    description:
      "2 people waiting on design assets. Consider prioritizing handoff.",
  },
  {
    type: "collaboration",
    color: "var(--blue)",
    bg: "#eff6ff",
    title: "Team collaboration spike",
    description:
      "Multiple mentions of pairing sessions. Team engagement is at a monthly high.",
  },
];

const stats = [
  { label: "Updates Today", value: "12", trend: "+20%", positive: true },
  { label: "Active Members", value: "8/10", trend: "80%", positive: true },
  { label: "Avg Response", value: "2.3h", trend: "-15%", positive: true },
];

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<TabId>("feed");

  return (
    <div
      style={{
        padding: "var(--space-24) 0",
        background: "var(--surface-2)",
      }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center"
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h1)",
              color: "var(--text-primary)",
              marginBottom: "12px",
              fontWeight: 400,
            }}
          >
            EXPERIENCE THE DASHBOARD
          </h2>
          <p
            className="mx-auto max-w-2xl"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "18px",
              fontWeight: 400,
              color: "var(--text-secondary)",
            }}
          >
            A purpose-built interface for async collaboration
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-5xl"
        >
          {/* Tab switcher */}
          <div className="mb-8 flex items-center justify-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 transition-all"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "13px",
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  cursor: "pointer",
                  background:
                    activeTab === tab.id
                      ? "var(--accent)"
                      : "var(--surface)",
                  color:
                    activeTab === tab.id ? "#ffffff" : "var(--text-secondary)",
                  boxShadow:
                    activeTab === tab.id
                      ? "none"
                      : "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <tab.icon size={14} strokeWidth={1.5} />
                {tab.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            {/* Feed tab */}
            {activeTab === "feed" && (
              <div className="space-y-4 p-8">
                {feedItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="p-5"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-lg)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div className="mb-4 flex items-start gap-3">
                      <div
                        className="flex flex-shrink-0 items-center justify-center"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "var(--surface-3)",
                          fontFamily: "var(--font-body)",
                          fontSize: "11px",
                          fontWeight: 500,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {item.initials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "13px",
                              fontWeight: 500,
                              color: "var(--text-primary)",
                            }}
                          >
                            {item.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span
                              style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "11px",
                                color: "var(--text-tertiary)",
                                background: "var(--surface-2)",
                                padding: "2px 8px",
                                borderRadius: "var(--radius-sm)",
                              }}
                            >
                              {item.team}
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "12px",
                                color: "var(--text-tertiary)",
                              }}
                            >
                              {item.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "11px",
                            color: "var(--green)",
                            letterSpacing: "0.06em",
                            minWidth: "52px",
                          }}
                        >
                          DONE
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {item.done}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "11px",
                            color: "var(--blue)",
                            letterSpacing: "0.06em",
                            minWidth: "52px",
                          }}
                        >
                          NEXT
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {item.next}
                        </span>
                      </div>
                      {item.blocker && (
                        <div className="flex items-start gap-2">
                          <span className="flex items-center gap-1" style={{ minWidth: "52px" }}>
                            <AlertCircle
                              size={10}
                              color="var(--red)"
                              strokeWidth={2}
                            />
                            <span
                              style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "11px",
                                color: "var(--red)",
                                letterSpacing: "0.06em",
                              }}
                            >
                              BLOCKED
                            </span>
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "13px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {item.blocker}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Insights tab */}
            {activeTab === "insights" && (
              <div className="space-y-6 p-8">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles
                    size={16}
                    strokeWidth={1.5}
                    color="var(--text-primary)"
                  />
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-h3)",
                      fontWeight: 400,
                      color: "var(--text-primary)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    TODAY'S AI INSIGHTS
                  </h3>
                </div>

                <div className="space-y-4">
                  {insights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5"
                      style={{
                        background: insight.bg,
                        borderLeft: `3px solid ${insight.color}`,
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <p
                        className="mb-1"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "var(--text-primary)",
                        }}
                      >
                        {insight.title}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "var(--text-small)",
                          color: "var(--text-secondary)",
                          lineHeight: 1.6,
                        }}
                      >
                        {insight.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics tab */}
            {activeTab === "analytics" && (
              <div className="p-8">
                <div className="grid gap-6 md:grid-cols-3">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="p-6 text-center"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-lg)",
                      }}
                    >
                      <p
                        className="mb-2"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "var(--text-label)",
                          color: "var(--text-tertiary)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {stat.label.toUpperCase()}
                      </p>
                      <p
                        className="mb-2"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "36px",
                          color: "var(--text-primary)",
                          fontWeight: 400,
                          lineHeight: 1.2,
                        }}
                      >
                        {stat.value}
                      </p>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "var(--green)",
                          background: "var(--green-surface)",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        {stat.trend}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
