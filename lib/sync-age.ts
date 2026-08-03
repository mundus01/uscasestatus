/** Relative age of the global corpus sync line in the site footer. */
export type SyncAge =
  | { kind: "never" }
  | { kind: "just_now" }
  | { kind: "minutes"; minutes: number }
  | { kind: "hours"; hours: number }
  | { kind: "days"; days: number };

/** Map a corpus sync timestamp to a footer-friendly relative age. */
export function syncAgeFromTimestamp(
  iso: string | null | undefined,
  now: Date = new Date(),
): SyncAge {
  if (!iso) return { kind: "never" };
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return { kind: "never" };

  const ageMs = Math.max(0, now.getTime() - then);
  const minutes = Math.floor(ageMs / 60_000);
  if (minutes < 1) return { kind: "just_now" };
  if (minutes < 60) return { kind: "minutes", minutes };
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return { kind: "hours", hours };
  return { kind: "days", days: Math.floor(hours / 24) };
}
