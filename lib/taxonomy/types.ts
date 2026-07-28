export type LifecycleStage =
  | "RECEIVED"
  | "BIOMETRICS"
  | "REVIEW"
  | "EVIDENCE_REQUESTED"
  | "INTERVIEW"
  | "DECISION"
  | "POST_DECISION"
  | "TERMINAL"
  | "UNKNOWN";

export type Severity =
  | "positive"
  | "info"
  | "attention"
  | "action_required"
  | "negative";

export type DecisionOutcome =
  | "APPROVED"
  | "DENIED"
  | "WITHDRAWN"
  | "REVOKED"
  | null;

export type StatusCode =
  | "CASE_RECEIVED"
  | "FEE_RECEIVED"
  | "BIOMETRICS_SCHEDULED"
  | "BIOMETRICS_TAKEN"
  | "ACTIVELY_REVIEWING"
  | "RFE_SENT"
  | "RFE_RESPONSE_RECEIVED"
  | "NOID_SENT"
  | "INTERVIEW_READY_TO_SCHEDULE"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_COMPLETE"
  | "OATH_SCHEDULED"
  | "CASE_TRANSFERRED"
  | "APPROVED"
  | "DENIED"
  | "WITHDRAWN"
  | "REVOKED"
  | "CARD_IN_PRODUCTION"
  | "CARD_MAILED"
  | "CARD_DELIVERED"
  | "NOTICE_MAILED"
  | "NOTICE_UNDELIVERABLE"
  | "FEE_REFUNDED"
  | "ADMIN_UPDATE"
  | "UNKNOWN";

export type StatusDef = {
  code: StatusCode;
  stage: LifecycleStage;
  severity: Severity;
  isTerminal: boolean;
  decisionOutcome: DecisionOutcome;
  /** Maps to existing explanation slugs where available. */
  explanationSlug: string | null;
  matchers: string[];
  allowedNext: StatusCode[];
};
