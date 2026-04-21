"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AppPreviewMock } from "./app-preview-mock";

export function Hero() {
  return (
    <section className="pt-24 pb-16" style={{ background: "linear-gradient(180deg, #FAFAF8 0%, #F5F4F0 100%)" }}>
      <div className="container mx-auto px-4">
        {/* Centered content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[680px] mx-auto text-center space-y-8"
        >
          {/* Eyebrow label */}
          <div
            className="tracking-[0.1em] uppercase"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-label)",
              fontWeight: 400,
              color: "var(--text-tertiary)",
              letterSpacing: "0.1em",
            }}
          >
            ASYNC STANDUPS FOR MODERN TEAMS
          </div>

          {/* Main heading */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-hero)",
              color: "var(--text-primary)",
              lineHeight: 1.1,
              fontWeight: 400,
            }}
          >
            ASYNC STANDUPS YOUR TEAM WILL <em>ACTUALLY</em> USE
          </h1>

          {/* Subheading */}
          <p
            className="max-w-[480px] mx-auto"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "18px",
              fontWeight: 400,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            Post updates anytime, get AI-powered summaries, and detect blockers
            early—without scheduling another meeting.
          </p>

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/dashboard">
              <button
                className="flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{
                  background: "var(--accent)",
                  color: "#ffffff",
                  height: "46px",
                  padding: "0 24px",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-display)",
                  fontSize: "14px",
                  fontWeight: 400,
                  border: "none",
                  letterSpacing: "0.02em",
                }}
              >
                START FREE
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </Link>
            <button
              className="transition-all hover:bg-[var(--surface-2)] hover:border-[var(--border-3)]"
              style={{
                background: "transparent",
                color: "var(--text-primary)",
                height: "46px",
                padding: "0 24px",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-display)",
                fontSize: "14px",
                fontWeight: 400,
                border: "1px solid var(--border-2)",
                letterSpacing: "0.02em",
              }}
            >
              VIEW DEMO
            </button>
          </div>

          {/* Trust indicators */}
          <div
            className="flex items-center justify-center gap-4"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--text-tertiary)",
            }}
          >
            <span>No credit card</span>
            <span>·</span>
            <span>Free for 5 users</span>
            <span>·</span>
            <span>Cancel anytime</span>
          </div>
        </motion.div>

        {/* App preview - full width below hero text */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 max-w-[1200px] mx-auto"
        >
          <AppPreviewMock />
        </motion.div>
      </div>
    </section>
  );
}
