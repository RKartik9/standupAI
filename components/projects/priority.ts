export const PRIORITY_LABELS: Record<number, string> = {
  1: "Critical",
  2: "High",
  3: "Normal",
  4: "Low",
};

export const PRIORITY_COLORS: Record<number, string> = {
  1: "var(--red)",
  2: "var(--amber)",
  3: "var(--blue)",
  4: "var(--text-tertiary)",
};

export const STATUS_LABELS: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export function formatHours(hours: number, hoursPerDay: number): string {
  if (hoursPerDay > 0 && hours >= hoursPerDay && hours % hoursPerDay === 0) {
    const days = hours / hoursPerDay;
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  if (hoursPerDay > 0 && hours === hoursPerDay / 2) return "half day";
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

export function memberName(
  first: string | null | undefined,
  last: string | null | undefined,
  email?: string | null,
): string {
  return `${first ?? ""} ${last ?? ""}`.trim() || email || "Unknown";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
