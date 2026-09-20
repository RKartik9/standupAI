/**
 * Deterministic name → member matching. The model tells us *who* it thinks a
 * task is for as free text; this resolves that text against real org members
 * so we never trust the model with a user id.
 */

export type MatchableMember = {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

export type MemberMatch =
  | { kind: "matched"; member: MatchableMember }
  | { kind: "ambiguous"; candidates: MatchableMember[] }
  | { kind: "unmatched" };

function norm(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

export function displayName(m: MatchableMember): string {
  const full = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim();
  return full || m.email || "Unknown";
}

export function matchMember(
  rawName: string | null | undefined,
  members: MatchableMember[],
): MemberMatch {
  const query = norm(rawName?.replace(/^@/, ""));
  if (!query) return { kind: "unmatched" };

  const tiers: Array<(m: MatchableMember) => boolean> = [
    // full name
    (m) => norm(`${m.firstName ?? ""} ${m.lastName ?? ""}`) === query,
    // first name only
    (m) => norm(m.firstName) === query,
    // last name only
    (m) => norm(m.lastName) === query,
    // email local part
    (m) => norm(m.email?.split("@")[0]) === query,
    // first token of the query is the first name ("kartik s")
    (m) => !!norm(m.firstName) && query.split(" ")[0] === norm(m.firstName),
    // starts-with on first name ("kart")
    (m) =>
      !!norm(m.firstName) &&
      query.length >= 3 &&
      norm(m.firstName).startsWith(query),
  ];

  for (const test of tiers) {
    const hits = members.filter(test);
    if (hits.length === 1) return { kind: "matched", member: hits[0] };
    if (hits.length > 1) return { kind: "ambiguous", candidates: hits };
  }

  return { kind: "unmatched" };
}

export function matchTeamName<T extends { id: string; name: string }>(
  rawName: string | null | undefined,
  teams: T[],
): T | null {
  const query = norm(rawName);
  if (!query) return null;
  const exact = teams.find((t) => norm(t.name) === query);
  if (exact) return exact;
  const partial = teams.filter(
    (t) => norm(t.name).includes(query) || query.includes(norm(t.name)),
  );
  return partial.length === 1 ? partial[0] : null;
}
