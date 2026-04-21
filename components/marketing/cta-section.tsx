"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section style={{ padding: "var(--space-24) 0", borderTop: "1px solid var(--border)" }}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[680px] mx-auto text-center"
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h1)",
              color: "var(--text-primary)",
              marginBottom: "16px",
              lineHeight: 1.2,
              fontWeight: 400,
            }}
          >
            READY TO <em>TRANSFORM</em> YOUR STANDUPS?
          </h2>

          <p
            className="mb-8"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "18px",
              fontWeight: 400,
              color: "var(--text-secondary)",
            }}
          >
            Join teams using StandupAI to run better async standups
          </p>

          <div className="flex items-center justify-center gap-3">
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
                START FREE TODAY
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </Link>
            <Link href="#features">
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
                LEARN MORE
              </button>
            </Link>
          </div>

          <div
            className="flex items-center justify-center gap-4 mt-8"
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
      </div>
    </section>
  );
}
