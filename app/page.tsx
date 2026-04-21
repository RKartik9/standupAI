import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { CTASection } from "@/components/marketing/cta-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          height: "56px",
          background: "rgba(250,250,248,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          <div
            style={{
              fontFamily: "Anton",
              fontSize: "15px",
              fontWeight: 500,
              color: "var(--text-primary)",
            }}
          >
            STANDUPAI
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="#features"
              style={{
                fontFamily: "Anton",
                fontSize: "14px",
                fontWeight: 400,
                color: "var(--text-secondary)",
                transition: "color 0.2s",
              }}
              className="hover:text-[var(--text-primary)]"
            >
              FEATURES
            </Link>
            <Link
              href="#how-it-works"
              style={{
                fontFamily: "Anton",
                fontSize: "14px",
                fontWeight: 400,
                color: "var(--text-secondary)",
                transition: "color 0.2s",
              }}
              className="hover:text-[var(--text-primary)]"
            >
              HOW IT WORKS
            </Link>
            <Link
              href="/sign-in"
              style={{
                fontFamily: "Anton",
                fontSize: "14px",
                fontWeight: 400,
                color: "var(--text-secondary)",
                transition: "color 0.2s",
              }}
              className="hover:text-[var(--text-primary)]"
            >
              SIGN IN
            </Link>
            <Link href="/dashboard">
              <button
                className="transition-all hover:opacity-90"
                style={{
                  background: "var(--accent)",
                  color: "#ffffff",
                  height: "36px",
                  padding: "0 16px",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "Anton",
                  fontSize: "14px",
                  fontWeight: 500,
                  border: "none",
                }}
              >
                GET STARTED
              </button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <Hero />

      {/* Features */}
      <div id="features">
        <Features />
      </div>

      {/* How It Works */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Product Showcase */}
      <ProductShowcase />

      {/* CTA */}
      <CTASection />

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "48px 0",
          background: "var(--surface-2)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div
                style={{
                  fontFamily: "Anton",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}
              >
                STANDUPAI
              </div>
              <p
                style={{
                  fontFamily: "Anton",
                  fontSize: "var(--text-small)",
                  color: "var(--text-secondary)",
                }}
              >
                ASYNC STANDUPS POWERED BY AI
              </p>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: "Anton",
                  fontSize: "var(--text-small)",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  marginBottom: "12px",
                }}
              >
                PRODUCT
              </h4>
              <ul className="space-y-2">
                {["Features", "Pricing", "Integrations"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      style={{
                        fontFamily: "Anton",
                        fontSize: "var(--text-small)",
                        color: "var(--text-secondary)",
                      }}
                      className="hover:text-[var(--text-primary)] transition-colors"
                    >
                      {item.toUpperCase()}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: "Anton",
                  fontSize: "var(--text-small)",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  marginBottom: "12px",
                }}
              >
                COMPANY
              </h4>
              <ul className="space-y-2">
                {["About", "Blog", "Careers"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      style={{
                        fontFamily: "Anton",
                        fontSize: "var(--text-small)",
                        color: "var(--text-secondary)",
                      }}
                      className="hover:text-[var(--text-primary)] transition-colors"
                    >
                      {item.toUpperCase()}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: "Anton",
                  fontSize: "var(--text-small)",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  marginBottom: "12px",
                }}
              >
                LEGAL
              </h4>
              <ul className="space-y-2">
                {["Privacy", "Terms", "Security"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      style={{
                        fontFamily: "Anton",
                        fontSize: "var(--text-small)",
                        color: "var(--text-secondary)",
                      }}
                      className="hover:text-[var(--text-primary)] transition-colors"
                    >
                      {item.toUpperCase()}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div
            className="text-center"
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "32px",
              fontFamily: "Anton",
              fontSize: "var(--text-small)",
              color: "var(--text-tertiary)",
            }}
          >
            <p>&copy; 2026 STANDUPAI. BUILT FOR ASYNC-FIRST TEAMS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
