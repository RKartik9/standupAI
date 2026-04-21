"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Sparkles,
  Users,
  BarChart3,
  Shield,
  Workflow,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Real-Time Updates",
    description:
      "See your team's updates instantly with live synchronization. No refresh needed.",
  },
  {
    icon: Sparkles,
    title: "AI Summaries",
    description:
      "Smart daily summaries highlighting progress, blockers, and priorities automatically.",
  },
  {
    icon: Users,
    title: "Team Insights",
    description:
      "Detect patterns, repeated blockers, and collaboration opportunities with AI.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Visualize team momentum and identify trends across sprints and projects.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Team-level data isolation with enterprise-grade security and compliance.",
  },
  {
    icon: Workflow,
    title: "Seamless Integration",
    description:
      "Works with your existing tools. Export to Slack, email, or your favorite platform.",
  },
];

export function Features() {
  return (
    <section style={{ padding: "var(--space-24) 0" }}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
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
            EVERYTHING YOU NEED
          </h2>
          <p
            className="max-w-2xl mx-auto"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "18px",
              fontWeight: 400,
              color: "var(--text-secondary)",
            }}
          >
            Every feature designed to make async standups effortless
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              custom={index}
              transition={{
                delay: index * 0.08,
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -2 }}
              className="transition-all"
            >
              <div
                className="h-full hover:shadow-md"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "20px 24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "all 0.2s ease",
                }}
              >
                <div>
                  <feature.icon
                    size={20}
                    strokeWidth={1.5}
                    color="var(--text-primary)"
                    style={{ marginBottom: "16px" }}
                  />
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-h3)",
                      fontWeight: 400,
                      color: "var(--text-primary)",
                      marginBottom: "8px",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {feature.title.toUpperCase()}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-small)",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
