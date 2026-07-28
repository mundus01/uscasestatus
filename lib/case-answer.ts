import type { ProcessingTimeContext } from "@/lib/processing-times";
import type { StatusDef } from "@/lib/taxonomy/types";

export function buildAnswerSentence(input: {
  statusLabel: string;
  statusDef: StatusDef;
  processing: ProcessingTimeContext | null;
  checkedAt: string;
  locale: string;
  copy: {
    decided: (args: { date: string; outcome: string; months: string }) => string;
    pendingDays: (args: { days: string }) => string;
    pendingOver: (args: { days: string }) => string;
    unknown: (args: { status: string }) => string;
  };
}): string {
  const { statusDef, processing, copy, statusLabel, locale } = input;

  if (statusDef.isTerminal) {
    const months = processing?.elapsed.months;
    const end = processing?.elapsed.referenceEnd;
    const date = end
      ? new Date(end).toLocaleDateString(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        })
      : "—";
    const outcome =
      statusDef.decisionOutcome === "DENIED" ? "denied" : "approved";
    return copy.decided({
      date,
      outcome,
      months: months != null ? String(months) : "—",
    });
  }

  if (processing?.elapsed.months != null) {
    const days = String(Math.max(1, Math.round(processing.elapsed.months * 30.44)));
    if (processing.position === "over") {
      return copy.pendingOver({ days });
    }
    return copy.pendingDays({ days });
  }

  return copy.unknown({ status: statusLabel });
}
