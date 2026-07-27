import type { Locale } from "@/i18n/routing";
import type { StatusTone } from "@/lib/status";

export type UscisHistoryEvent = {
  date: string | null;
  statusText: string;
  statusDescription: string | null;
};

export type UscisCasePayload = {
  receiptNumber: string;
  formType: string | null;
  submittedDate: string | null;
  modifiedDate: string | null;
  statusText: Record<Locale, string>;
  statusDescription: Record<Locale, string>;
  history: UscisHistoryEvent[];
};

export type UscisFetchErrorCode =
  | "not_found"
  | "upstream"
  | "unauthorized"
  | "invalid_response"
  | "not_configured";

export type UscisFetchResult =
  | { ok: true; data: UscisCasePayload; source: "live" | "cache" | "mock" }
  | { ok: false; code: UscisFetchErrorCode; message: string };

export type TimelineStepId =
  | "received"
  | "biometrics"
  | "review"
  | "interview"
  | "decision"
  | "card";

export type TimelineStepState = "complete" | "current" | "upcoming";

export type TimelineStep = {
  id: TimelineStepId;
  state: TimelineStepState;
};

export type StatusExplanation = {
  slug: string;
  /** Exact English status titles this explanation covers. */
  match: string[];
  tone: StatusTone;
  isPositive: boolean;
  timelineStep: TimelineStepId;
  plainEnglish: Record<Locale, string>;
  whatToDo: Record<Locale, string>;
};
