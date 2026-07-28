import { parseUscisDate } from "@/lib/uscis/dates";

export type ElapsedMode = "pending" | "decided";

export type Elapsed = {
  mode: ElapsedMode;
  months: number | null;
  referenceStart: string | null;
  referenceStartSource: "receipt_notice" | "first_event" | "user" | null;
  isEstimated: boolean;
  /** ISO date used as the clock end (decision or now). */
  referenceEnd: string | null;
};

export type RangePosition = "within" | "over" | "under" | "unknown";

/**
 * Elapsed processing time.
 * MUST stop accruing at the decision for terminal cases (§11.2).
 */
export function computeElapsed(input: {
  receivedAt: Date | null;
  decidedAt: Date | null;
  isTerminal: boolean;
  receivedAtSource?: Elapsed["referenceStartSource"];
  isEstimated?: boolean;
  now?: Date;
}): Elapsed {
  const start = input.receivedAt;
  if (!start) {
    return {
      mode: input.isTerminal ? "decided" : "pending",
      months: null,
      referenceStart: null,
      referenceStartSource: null,
      isEstimated: false,
      referenceEnd: null,
    };
  }

  const end = input.isTerminal
    ? (input.decidedAt ?? start)
    : (input.now ?? new Date());

  return {
    mode: input.isTerminal ? "decided" : "pending",
    months: monthsBetween(start, end),
    referenceStart: start.toISOString(),
    referenceStartSource: input.receivedAtSource ?? "receipt_notice",
    isEstimated: input.isEstimated ?? false,
    referenceEnd: end.toISOString(),
  };
}

export function rangePosition(
  months: number | null,
  lowMonths: number,
  highMonths: number,
): RangePosition {
  if (months == null) return "unknown";
  if (months < lowMonths) return "under";
  if (months > highMonths) return "over";
  return "within";
}

export function resolveDecisionDate(input: {
  isTerminal: boolean;
  modifiedDate: string | null;
  submittedDate: string | null;
  history: Array<{ date: string | null }>;
}): Date | null {
  if (!input.isTerminal) return null;

  const modified = parseUscisDate(input.modifiedDate);
  if (modified) return modified;

  for (const event of input.history) {
    const d = parseUscisDate(event.date);
    if (d) return d;
  }

  return parseUscisDate(input.submittedDate);
}

export function monthsBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  if (ms < 0) return 0;
  return Math.round((ms / (1000 * 60 * 60 * 24 * 30.44)) * 10) / 10;
}
