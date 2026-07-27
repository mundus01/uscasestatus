import processingTimesData from "@/data/processing-times.json";

import type { ReceiptPrefix } from "@/lib/receipt";

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
  monthsSinceFiled: number | null;
};

export function getProcessingTimeContext(options: {
  formType: string | null;
  prefix: ReceiptPrefix;
  submittedDate: string | null;
  estimatedFilingDate: Date | null;
}): ProcessingTimeContext | null {
  if (!options.formType) return null;

  const formTimes = data.forms[options.formType];
  if (!formTimes) return null;

  const centerCode = PREFIX_TO_CENTER[options.prefix] ?? null;
  const range =
    (centerCode && formTimes.centers[centerCode]) || formTimes.default;

  const filedAt =
    parseUscisDate(options.submittedDate) ?? options.estimatedFilingDate;
  const monthsSinceFiled = filedAt ? monthsBetween(filedAt, new Date()) : null;

  return {
    formType: options.formType,
    centerCode,
    lowMonths: range.lowMonths,
    highMonths: range.highMonths,
    monthsSinceFiled,
  };
}

/** Parses USCIS dates like "09-05-2023 14:28:46" or "09-05-2023". */
export function parseUscisDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = value.trim().match(
    /^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+(\d{1,2}):(\d{2}):(\d{2}))?$/,
  );
  if (!match) return null;

  const month = Number(match[1]) - 1;
  const day = Number(match[2]);
  const year = Number(match[3]);
  const hour = Number(match[4] ?? 0);
  const minute = Number(match[5] ?? 0);
  const second = Number(match[6] ?? 0);

  const date = new Date(Date.UTC(year, month, day, hour, minute, second));
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthsBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  if (ms < 0) return 0;
  return Math.round((ms / (1000 * 60 * 60 * 24 * 30.44)) * 10) / 10;
}
