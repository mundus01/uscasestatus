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

export const USCIS_HISTORIC_PT_URL =
  "https://egov.uscis.gov/processing-times/historic-pt";

type Range = { lowMonths: number; highMonths: number };

type FormTimes = {
  classification?: string;
  titleEn?: string;
  titleEs?: string;
  latestFiscalYear?: string;
  latestMedianMonths?: number;
  default: Range;
  centers: Record<string, Range>;
  byFiscalYear?: Record<string, number>;
};

type ProcessingTimesFile = {
  _meta?: {
    source?: string;
    sourceLabel?: string;
    methodology?: string;
    coverageNote?: string;
    updated?: string;
  };
  forms: Record<string, FormTimes>;
};

const data = processingTimesData as ProcessingTimesFile;

/**
 * Receipt prefixes historically mapped to service centers. Historic-pt data is
 * national-only, so these codes are retained for labeling when a prefix is known
 * but never select a different numeric range.
 */
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
  latestMedianMonths: number | null;
  latestFiscalYear: string | null;
  classification: string | null;
  /** @deprecated use elapsed.months — kept briefly for callers */
  monthsSinceFiled: number | null;
  elapsed: Elapsed;
  position: RangePosition;
  isTerminal: boolean;
  /** Always true for historic-pt (national medians; no office series). */
  usedNationalFallback: boolean;
  sourceLabel: "uscis_historic_processing_times";
  sourceUrl: string;
};

export function getProcessingTimesMeta() {
  return {
    sourceUrl: data._meta?.source ?? USCIS_HISTORIC_PT_URL,
    sourceLabel: data._meta?.sourceLabel ?? "USCIS historic processing times",
    methodology: data._meta?.methodology ?? null,
    coverageNote: data._meta?.coverageNote ?? null,
    updated: data._meta?.updated ?? null,
  };
}

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
  // Historic-pt publishes national medians only — ignore any legacy center overrides.
  const range = formTimes.default;
  const usedNationalFallback = true;
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
    latestMedianMonths: formTimes.latestMedianMonths ?? null,
    latestFiscalYear: formTimes.latestFiscalYear ?? null,
    classification: formTimes.classification ?? null,
    monthsSinceFiled: elapsed.months,
    elapsed,
    position: rangePosition(elapsed.months, range.lowMonths, range.highMonths),
    isTerminal,
    usedNationalFallback,
    sourceLabel: "uscis_historic_processing_times",
    sourceUrl: data._meta?.source ?? USCIS_HISTORIC_PT_URL,
  };
}
