"use client";

import { motion } from "framer-motion";
import { Edit3, Brain, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Edit3,
    title: "Post Your Update",
    description:
      "Share what you did, what's next, and any blockers in under a minute.",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI Processes",
    description:
      "Our AI analyzes team updates to identify patterns, blockers, and priorities.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Get Insights",
    description:
      "Receive actionable summaries and smart suggestions to keep your team aligned.",
  },
];

export function HowItWorks() {
  return (
    <section style={{ padding: "var(--space-24) 0", background: "var(--surface-2)" }}>
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
            HOW IT WORKS
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
            Three simple steps to better async standups
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.08,
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="text-center">
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "48px",
                    color: "var(--text-tertiary)",
                    marginBottom: "16px",
                    fontWeight: 400,
                  }}
                >
                  {step.number}
                </div>
                <step.icon
                  size={24}
                  strokeWidth={1.5}
                  color="var(--text-primary)"
                  style={{ margin: "0 auto 16px" }}
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
                  {step.title.toUpperCase()}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-small)",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
