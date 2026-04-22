import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
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
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          <Link
            href="/"
            style={{
              fontFamily: "Anton",
              fontSize: "15px",
              fontWeight: 400,
              color: "var(--text-primary)",
              letterSpacing: "0.02em",
              textDecoration: "none",
            }}
          >
            STANDUPAI
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="#features"
              style={{
                fontFamily: "Anton",
                fontSize: "13px",
                fontWeight: 400,
                color: "var(--text-secondary)",
                transition: "color 0.2s",
                textDecoration: "none",
              }}
              className="hover:text-[var(--text-primary)]"
            >
              FEATURES
            </Link>
            <Link
              href="#how-it-works"
              style={{
                fontFamily: "Anton",
                fontSize: "13px",
                fontWeight: 400,
                color: "var(--text-secondary)",
                transition: "color 0.2s",
                textDecoration: "none",
              }}
              className="hover:text-[var(--text-primary)]"
            >
              HOW IT WORKS
            </Link>
            <Link
              href="#showcase"
              style={{
                fontFamily: "Anton",
                fontSize: "13px",
                fontWeight: 400,
                color: "var(--text-secondary)",
                transition: "color 0.2s",
                textDecoration: "none",
              }}
              className="hover:text-[var(--text-primary)]"
            >
              PRODUCT
            </Link>

            {/* Clerk Auth - Signed Out: show Sign In + Get Started */}
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  style={{
                    fontFamily: "Anton",
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "var(--text-secondary)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                    transition: "color 0.2s",
                  }}
                  className="hover:text-[var(--text-primary)]"
                >
                  SIGN IN
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  className="transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "var(--accent)",
                    color: "#ffffff",
                    height: "34px",
                    padding: "0 16px",
                    borderRadius: "var(--radius-md)",
                    fontFamily: "Anton",
                    fontSize: "13px",
                    fontWeight: 400,
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                  }}
                >
                  GET STARTED
                </button>
              </SignUpButton>
            </Show>

            {/* Clerk Auth - Signed In: show Dashboard link + UserButton */}
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "var(--accent)",
                  color: "#ffffff",
                  height: "34px",
                  padding: "0 16px",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "Anton",
                  fontSize: "13px",
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                DASHBOARD
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: { width: "30px", height: "30px" },
                  },
                }}
              />
            </Show>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <Hero />

      {/* Features */}
      <section id="features">
        <Features />
      </section>

      {/* How It Works */}
      <section id="how-it-works">
        <HowItWorks />
      </section>

      {/* Product Showcase */}
      <section id="showcase">
        <ProductShowcase />
      </section>

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
              <Link
                href="/"
                style={{
                  fontFamily: "Anton",
                  fontSize: "15px",
                  fontWeight: 400,
                  color: "var(--text-primary)",
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                }}
              >
                STANDUPAI
              </Link>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-small)",
                  color: "var(--text-secondary)",
                }}
              >
                Async standups powered by AI.
              </p>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: "Anton",
                  fontSize: "var(--text-label)",
                  fontWeight: 400,
                  color: "var(--text-tertiary)",
                  marginBottom: "12px",
                  letterSpacing: "0.08em",
                }}
              >
                PRODUCT
              </h4>
              <ul className="space-y-2">
                {[
                  { label: "Features", href: "#features" },
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Product", href: "#showcase" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-small)",
                        color: "var(--text-secondary)",
                        textDecoration: "none",
                      }}
                      className="hover:text-[var(--text-primary)] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: "Anton",
                  fontSize: "var(--text-label)",
                  fontWeight: 400,
                  color: "var(--text-tertiary)",
                  marginBottom: "12px",
                  letterSpacing: "0.08em",
                }}
              >
                ACCOUNT
              </h4>
              <ul className="space-y-2">
                {[
                  { label: "Sign In", href: "/sign-in" },
                  { label: "Sign Up", href: "/sign-up" },
                  { label: "Dashboard", href: "/dashboard" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-small)",
                        color: "var(--text-secondary)",
                        textDecoration: "none",
                      }}
                      className="hover:text-[var(--text-primary)] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: "Anton",
                  fontSize: "var(--text-label)",
                  fontWeight: 400,
                  color: "var(--text-tertiary)",
                  marginBottom: "12px",
                  letterSpacing: "0.08em",
                }}
              >
                LEGAL
              </h4>
              <ul className="space-y-2">
                {["Privacy", "Terms", "Security"].map((item) => (
                  <li key={item}>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-small)",
                        color: "var(--text-tertiary)",
                        cursor: "default",
                      }}
                    >
                      {item}
                    </span>
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
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-small)",
              color: "var(--text-tertiary)",
            }}
          >
            <p>&copy; 2026 StandupAI. Built for async-first teams.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
