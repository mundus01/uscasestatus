import processingTimesData from "@/data/processing-times.json";

import {
  computeElapsed,
  rangePosition,
  resolveDecisionDate,
  type Elapsed,
  type RangePosition,
} from "@/lib/forecast/elapsed";
import type { ReceiptPrefix } from "@/lib/receipt";
import { parseUscisDate } from "@/lib/uscis/dates";
import type { UscisHistoryEvent } from "@/lib/uscis/types";

export { parseUscisDate } from "@/lib/uscis/dates";

type Range = { lowMonths: number; highMonths: number };

type FormTimes = {
  default: Range;
  centers: Record<string, Range>;
};

type ProcessingTimesFile = {
  forms: Record<string, FormTimes>;
};

const data = processingTimesData as ProcessingTimesFile;

/** Maps receipt prefixes to the center codes used in processing-times.json. */
const PREFIX_TO_CENTER: Partial<Record<ReceiptPrefix, string>> = {
  WAC: "CSC",
  EAC: "VSC",
  LIN: "NSC",
  SRC: "TSC",
  YSC: "PSC",
  NBC: "NBC",
  MSC: "MSC",
  IOE: "ELIS",
};

export type ProcessingTimeContext = {
  formType: string;
  centerCode: string | null;
  lowMonths: number;
  highMonths: number;
  /** @deprecated use elapsed.months — kept briefly for callers */
  monthsSinceFiled: number | null;
  elapsed: Elapsed;
  position: RangePosition;
  isTerminal: boolean;
  usedNationalFallback: boolean;
  sourceLabel: "published_uscis_range";
};

export function getProcessingTimeContext(options: {
  formType: string | null;
  prefix: ReceiptPrefix;
  submittedDate: string | null;
  estimatedFilingDate: Date | null;
  isTerminal?: boolean;
  modifiedDate?: string | null;
  history?: UscisHistoryEvent[];
}): ProcessingTimeContext | null {
  if (!options.formType) return null;

  const formTimes = data.forms[options.formType];
  if (!formTimes) return null;

  const centerCode = PREFIX_TO_CENTER[options.prefix] ?? null;
  const centerRange = centerCode ? formTimes.centers[centerCode] : undefined;
  const range = centerRange ?? formTimes.default;
  const usedNationalFallback = !centerRange;
  const isTerminal = options.isTerminal ?? false;
  const history = options.history ?? [];

  const receivedAt =
    parseUscisDate(options.submittedDate) ?? options.estimatedFilingDate;
  const isEstimated = !parseUscisDate(options.submittedDate) && Boolean(receivedAt);

  const decidedAt = resolveDecisionDate({
    isTerminal,
    modifiedDate: options.modifiedDate ?? null,
    submittedDate: options.submittedDate,
    history,
  });

  const elapsed = computeElapsed({
    receivedAt,
    decidedAt,
    isTerminal,
    receivedAtSource: parseUscisDate(options.submittedDate)
      ? "receipt_notice"
      : receivedAt
        ? "first_event"
        : null,
    isEstimated,
  });

  return {
    formType: options.formType,
    centerCode,
    lowMonths: range.lowMonths,
    highMonths: range.highMonths,
    monthsSinceFiled: elapsed.months,
    elapsed,
    position: rangePosition(elapsed.months, range.lowMonths, range.highMonths),
    isTerminal,
    usedNationalFallback,
    sourceLabel: "published_uscis_range",
  };
}

