"use client";

import { Home, Users, Settings, Sparkles, AlertCircle } from "lucide-react";

export function AppPreviewMock() {
  return (
    <div
      className="overflow-hidden"
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-2xl)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.08)",
        background: "var(--surface)",
      }}
    >
      {/* macOS-style chrome */}
      <div
        className="flex items-center px-4 py-3"
        style={{
          background: "var(--surface-2)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div
          className="flex-1 text-center text-xs"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--text-tertiary)",
          }}
        >
          StandupAI
        </div>
        <div className="w-[60px]" />
      </div>

      {/* Dashboard layout */}
      <div className="flex h-[600px]">
        {/* Sidebar */}
        <div
          className="w-[220px] flex flex-col p-4"
          style={{
            background: "var(--surface-2)",
            borderRight: "1px solid var(--border)",
          }}
        >
          {/* Logo */}
          <div className="mb-6">
            <div
              className="font-medium"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "15px",
                fontWeight: 400,
                color: "var(--text-primary)",
                letterSpacing: "0.02em",
              }}
            >
              STANDUPAI
            </div>
          </div>

          {/* Team selector */}
          <div className="mb-6">
            <div
              className="uppercase mb-2"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-label)",
                fontWeight: 400,
                color: "var(--text-tertiary)",
                letterSpacing: "0.08em",
              }}
            >
              TEAM
            </div>
            <div
              className="px-3 py-2"
              style={{
                background: "var(--surface-3)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <div
                className="font-medium"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}
              >
                Engineering
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  color: "var(--text-tertiary)",
                }}
              >
                8 members
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{
                background: "var(--surface-3)",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              <Home size={15} strokeWidth={1.5} />
              <span>Home</span>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--surface-3)] cursor-pointer"
              style={{
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              <Users size={15} strokeWidth={1.5} />
              <span>Team</span>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--surface-3)] cursor-pointer"
              style={{
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              <Settings size={15} strokeWidth={1.5} />
              <span>Settings</span>
            </div>
          </nav>
        </div>

        {/* Main feed */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {/* Feed header */}
          <div className="mb-6">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-h2)",
                color: "var(--text-primary)",
                marginBottom: "4px",
                fontWeight: 400,
              }}
            >
              TODAY'S UPDATES
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-small)",
                color: "var(--text-secondary)",
              }}
            >
              3 updates from your team
            </p>
          </div>

          {/* Update cards */}
          {[
            {
              name: "Sarah Chen",
              initials: "SC",
              time: "2h ago",
              done: "Completed user authentication flow",
              next: "Starting dashboard analytics",
              blocker: null,
            },
            {
              name: "Marcus Johnson",
              initials: "MJ",
              time: "4h ago",
              done: "Fixed payment bug, deployed to production",
              next: "API optimization work",
              blocker: "Waiting for design assets",
            },
          ].map((update, i) => (
            <div
              key={i}
              className="p-5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#E8E6E0",
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                  }}
                >
                  {update.initials}
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
                      {update.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "12px",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {update.time}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div
                    className="uppercase mb-1"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "11px",
                      fontWeight: 400,
                      color: "var(--green)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    DONE
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.55,
                    }}
                  >
                    {update.done}
                  </p>
                </div>

                <div
                  style={{
                    height: "1px",
                    background: "var(--border)",
                    margin: "8px 0",
                  }}
                />

                <div>
                  <div
                    className="uppercase mb-1"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "11px",
                      fontWeight: 400,
                      color: "var(--blue)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    NEXT
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.55,
                    }}
                  >
                    {update.next}
                  </p>
                </div>

                {update.blocker && (
                  <>
                    <div
                      style={{
                        height: "1px",
                        background: "var(--border)",
                        margin: "8px 0",
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <AlertCircle size={12} color="var(--red)" strokeWidth={2} />
                        <span
                          className="uppercase"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "11px",
                            fontWeight: 400,
                            color: "var(--red)",
                            letterSpacing: "0.06em",
                          }}
                        >
                          BLOCKED
                        </span>
                      </div>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                          lineHeight: 1.55,
                        }}
                      >
                        {update.blocker}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* AI Panel */}
        <div
          className="w-[260px] p-5"
          style={{
            background: "var(--surface)",
            borderLeft: "1px solid var(--border)",
          }}
        >
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={15} strokeWidth={1.5} color="var(--text-primary)" />
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "13px",
                  fontWeight: 400,
                  color: "var(--text-primary)",
                  letterSpacing: "0.02em",
                }}
              >
                AI SUMMARY
              </h3>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                color: "var(--text-tertiary)",
              }}
            >
              Generated from today's updates
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div
                className="uppercase mb-2"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "11px",
                  fontWeight: 400,
                  color: "var(--text-tertiary)",
                  letterSpacing: "0.08em",
                }}
              >
                PROGRESS
              </div>
              <ul className="space-y-2">
                {["Auth flow completed", "Payment bug fixed", "Dashboard work started"].map(
                  (item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                      }}
                    >
                      <div
                        className="flex-shrink-0 mt-1"
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: "var(--green)",
                        }}
                      />
                      <span>{item}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div
              style={{
                height: "1px",
                background: "var(--border)",
              }}
            />

            <div>
              <div
                className="uppercase mb-2"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "11px",
                  fontWeight: 400,
                  color: "var(--text-tertiary)",
                  letterSpacing: "0.08em",
                }}
              >
                BLOCKERS
              </div>
              <ul className="space-y-2">
                <li
                  className="flex items-start gap-2"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  <div
                    className="flex-shrink-0 mt-1"
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: "var(--red)",
                    }}
                  />
                  <span>1 member waiting on design</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
