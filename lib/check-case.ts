import "server-only";

import { receiptBlock, estimateFilingDateFromReceipt } from "@/lib/filing-date";
import { getCachedCase, setCachedCase } from "@/lib/case-cache";
import {
  findExplanation,
  getExplanationCopy,
  statusSlugFromText,
} from "@/lib/explanations";
import { upsertCaseFromCheck } from "@/lib/case-store";
import { logLookup } from "@/lib/lookups";
import { getProcessingTimeContext } from "@/lib/processing-times";
import type { ReceiptPrefix } from "@/lib/receipt";
import { validateReceipt } from "@/lib/receipt";
import { buildTimeline } from "@/lib/timeline";
import { fetchUscisCase } from "@/lib/uscis/client";
import type {
  StatusExplanation,
  TimelineStep,
  UscisCasePayload,
} from "@/lib/uscis/types";
import type { Locale } from "@/i18n/routing";
import type { StatusTone } from "@/lib/status";
import type { ProcessingTimeContext } from "@/lib/processing-times";

export type CheckCaseErrorCode =
  | "invalid_receipt"
  | "not_found"
  | "upstream"
  | "unauthorized"
  | "rate_limited";

export type CheckCaseSuccess = {
  receipt: string;
  prefix: ReceiptPrefix;
  formType: string | null;
  /** Localized for the requesting UI. */
  statusText: string;
  statusDescription: string;
  /** Canonical English — used for corpus, matching, and alerts. */
  statusTextEn: string;
  statusDescriptionEn: string;
  tone: StatusTone;
  isPositive: boolean;
  plainEnglish: string;
  whatToDo: string;
  explanationSlug: string;
  timeline: TimelineStep[];
  processingTime: ProcessingTimeContext | null;
  submittedDate: string | null;
  modifiedDate: string | null;
  checkedAt: string;
  source: "live" | "cache" | "mock";
  history: UscisCasePayload["history"];
};

export type CheckCaseResult =
  | { ok: true; data: CheckCaseSuccess }
  | { ok: false; code: CheckCaseErrorCode; message: string };

export async function checkCase(
  rawReceipt: string,
  locale: Locale,
  options?: { bypassCache?: boolean },
): Promise<CheckCaseResult> {
  const validation = validateReceipt(rawReceipt);
  if (!validation.ok) {
    return {
      ok: false,
      code: "invalid_receipt",
      message: "Enter a valid 13-character USCIS receipt number.",
    };
  }

  const { receipt, prefix } = validation;

  const cached = options?.bypassCache ? null : await getCachedCase(receipt);
  let payload: UscisCasePayload;
  let source: CheckCaseSuccess["source"];

  if (cached) {
    payload = cached;
    source = "cache";
  } else {
    const fetched = await fetchUscisCase(receipt);
    if (!fetched.ok) {
      return {
        ok: false,
        code: fetched.code === "not_found" ? "not_found" : fetched.code === "unauthorized" ? "unauthorized" : "upstream",
        message: fetched.message,
      };
    }
    payload = fetched.data;
    source = fetched.source;
    // Cache live and mock results so anxious refreshers share one upstream hit.
    await setCachedCase(receipt, payload);
  }

  const explanation = findExplanation(payload.statusText.en);
  const copy = getExplanationCopy(explanation, locale);
  const formType = payload.formType;
  const timeline = buildTimeline(formType, explanation.timelineStep);
  const processingTime = getProcessingTimeContext({
    formType,
    prefix,
    submittedDate: payload.submittedDate,
    estimatedFilingDate: estimateFilingDateFromReceipt(receipt),
  });

  const success: CheckCaseSuccess = {
    receipt,
    prefix,
    formType,
    statusText: payload.statusText[locale] || payload.statusText.en,
    statusDescription:
      payload.statusDescription[locale] || payload.statusDescription.en,
    statusTextEn: payload.statusText.en,
    statusDescriptionEn: payload.statusDescription.en,
    tone: copy.tone,
    isPositive: explanation.isPositive,
    plainEnglish: copy.plainEnglish,
    whatToDo: copy.whatToDo,
    explanationSlug: explanation.slug,
    timeline,
    processingTime,
    submittedDate: payload.submittedDate,
    modifiedDate: payload.modifiedDate,
    checkedAt: new Date().toISOString(),
    source,
    history: payload.history,
  };

  // Corpus writes are best-effort and never block the response.
  void logLookup({
    receiptBlock: receiptBlock(receipt),
    prefix,
    formType,
    statusSlug: explanation.slug === "unknown"
      ? statusSlugFromText(payload.statusText.en)
      : explanation.slug,
    statusText: payload.statusText.en,
  });
  void upsertCaseFromCheck(success);

  return { ok: true, data: success };
}

export type { StatusExplanation };
