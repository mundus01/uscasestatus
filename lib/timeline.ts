import { getForm } from "@/lib/forms";
import { normalizeStatus } from "@/lib/taxonomy/normalize";
import type { StatusCode } from "@/lib/taxonomy/types";
import { parseUscisDate } from "@/lib/uscis/dates";
import type {
  TimelineStep,
  TimelineStepId,
  UscisHistoryEvent,
} from "@/lib/uscis/types";

const STEP_ORDER: TimelineStepId[] = [
  "received",
  "biometrics",
  "review",
  "interview",
  "decision",
  "card",
];

const POST_DECISION_CODES: StatusCode[] = [
  "CARD_IN_PRODUCTION",
  "CARD_MAILED",
  "CARD_DELIVERED",
];

export type TimelineDateSource = "reported" | "observed";

export type CaseTimelineNode = {
  id: string;
  kind: "completed" | "current" | "expected";
  /** Stage id when this node is part of the form path; null for free-form events. */
  stageId: TimelineStepId | null;
  label: string;
  dateIso: string | null;
  dateSource: TimelineDateSource | null;
};

export type CaseTimelineModel = {
  nodes: CaseTimelineNode[];
  /** True when we only have the current status (no full history). */
  singleEventNote: boolean;
  trackingStartedAt: string | null;
  totalActualEvents: number;
  collapsed: boolean;
};

/**
 * Builds the typical path for a form, highlighting where the current status sits.
 * Kept for callers that only need stage progression.
 */
export function buildTimeline(
  formType: string | null,
  currentStep: TimelineStepId,
): TimelineStep[] {
  const steps = formStageSequence(formType);
  const effectiveCurrent = resolveCurrentStep(steps, currentStep);
  const currentIndex = steps.indexOf(effectiveCurrent);

  return steps.map((id, index) => ({
    id,
    state:
      index < currentIndex
        ? "complete"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));
}

/**
 * Rebuilds the case timeline from actual events + expected form stages (§10).
 */
export function buildCaseTimeline(input: {
  formType: string | null;
  currentStep: TimelineStepId;
  currentStatusText: string;
  statusCode: StatusCode;
  isTerminal: boolean;
  submittedDate: string | null;
  modifiedDate: string | null;
  history: UscisHistoryEvent[];
  /** When we first observed the case (checkedAt), for the single-event note. */
  trackingStartedAt: string | null;
}): CaseTimelineModel {
  const actuals = collectActualEvents(input);
  const stages = formStageSequence(input.formType);
  const currentStage = resolveCurrentStep(stages, input.currentStep);
  const currentStageIndex = stages.indexOf(currentStage);

  const nodes: CaseTimelineNode[] = [];

  if (actuals.length > 0) {
    for (let i = 0; i < actuals.length; i += 1) {
      const event = actuals[i];
      const isLast = i === actuals.length - 1;
      nodes.push({
        id: `event-${i}`,
        kind: isLast ? "current" : "completed",
        stageId: statusTextToStage(event.statusText),
        label: event.statusText,
        dateIso: event.dateIso,
        dateSource: event.dateSource,
      });
    }
  } else {
    // Fallback: stage rail only (no dated events yet).
    for (let i = 0; i <= currentStageIndex; i += 1) {
      const id = stages[i];
      nodes.push({
        id: `stage-${id}`,
        kind: i === currentStageIndex ? "current" : "completed",
        stageId: id,
        label: id,
        dateIso: null,
        dateSource: null,
      });
    }
  }

  if (!input.isTerminal) {
    for (let i = currentStageIndex + 1; i < stages.length; i += 1) {
      const id = stages[i];
      nodes.push({
        id: `expected-${id}`,
        kind: "expected",
        stageId: id,
        label: id,
        dateIso: null,
        dateSource: null,
      });
    }
  } else if (showsPostDecisionPath(input.formType, input.statusCode)) {
    for (const code of POST_DECISION_CODES) {
      if (alreadyHasStatus(actuals, code) || input.statusCode === code) continue;
      if (stageReached(input.statusCode, code)) continue;
      nodes.push({
        id: `expected-${code}`,
        kind: "expected",
        stageId: "card",
        label: code,
        dateIso: null,
        dateSource: null,
      });
    }
  }

  const totalActualEvents = actuals.length;

  return {
    nodes,
    singleEventNote: totalActualEvents <= 1,
    trackingStartedAt: input.trackingStartedAt,
    totalActualEvents,
    collapsed: totalActualEvents > 5,
  };
}

function formStageSequence(formType: string | null): TimelineStepId[] {
  const form = formType ? getForm(formType) : undefined;
  const steps: TimelineStepId[] = ["received"];

  if (!form || form.hasBiometrics) {
    steps.push("biometrics");
  }

  steps.push("review");

  if (!form || form.hasInterview) {
    steps.push("interview");
  }

  steps.push("decision");

  if (!form || form.producesCard) {
    steps.push("card");
  }

  return steps;
}

function resolveCurrentStep(
  steps: TimelineStepId[],
  current: TimelineStepId,
): TimelineStepId {
  if (steps.includes(current)) return current;

  const currentOrder = STEP_ORDER.indexOf(current);
  for (let i = steps.length - 1; i >= 0; i -= 1) {
    if (STEP_ORDER.indexOf(steps[i]) <= currentOrder) {
      return steps[i];
    }
  }

  return steps[0];
}

function collectActualEvents(input: {
  currentStatusText: string;
  submittedDate: string | null;
  modifiedDate: string | null;
  history: UscisHistoryEvent[];
}): Array<{
  statusText: string;
  dateIso: string | null;
  dateSource: TimelineDateSource | null;
}> {
  const fromHistory = [...input.history]
    .map((event) => {
      const parsed = parseUscisDate(event.date);
      return {
        statusText: event.statusText,
        dateIso: parsed?.toISOString() ?? null,
        dateSource: (parsed ? "reported" : null) as TimelineDateSource | null,
      };
    })
    .filter((event) => event.statusText.trim().length > 0);

  if (fromHistory.length > 0) {
    // Ensure current status is the last node if history omitted it.
    const last = fromHistory[fromHistory.length - 1];
    if (
      normalizeStatus(last.statusText).code !==
      normalizeStatus(input.currentStatusText).code
    ) {
      const modified = parseUscisDate(input.modifiedDate);
      fromHistory.push({
        statusText: input.currentStatusText,
        dateIso: modified?.toISOString() ?? null,
        dateSource: modified ? "reported" : null,
      });
    }
    return fromHistory;
  }

  // Single-event fallback from Torch payload fields when history is empty.
  const submitted = parseUscisDate(input.submittedDate);
  const modified = parseUscisDate(input.modifiedDate);
  const currentCode = normalizeStatus(input.currentStatusText).code;
  const events: Array<{
    statusText: string;
    dateIso: string | null;
    dateSource: TimelineDateSource | null;
  }> = [];

  if (currentCode !== "CASE_RECEIVED" && submitted) {
    events.push({
      statusText: "Case Was Received",
      dateIso: submitted.toISOString(),
      dateSource: "reported",
    });
  }

  const currentDate = modified ?? submitted;
  events.push({
    statusText: input.currentStatusText,
    dateIso: currentDate?.toISOString() ?? null,
    dateSource: currentDate ? "reported" : null,
  });

  return events;
}

function statusTextToStage(statusText: string): TimelineStepId | null {
  const def = normalizeStatus(statusText);
  switch (def.stage) {
    case "RECEIVED":
      return "received";
    case "BIOMETRICS":
      return "biometrics";
    case "REVIEW":
    case "EVIDENCE_REQUESTED":
      return "review";
    case "INTERVIEW":
      return "interview";
    case "DECISION":
    case "TERMINAL":
      return "decision";
    case "POST_DECISION":
      return "card";
    default:
      return null;
  }
}

function showsPostDecisionPath(
  formType: string | null,
  statusCode: StatusCode,
): boolean {
  const form = formType ? getForm(formType) : undefined;
  if (form && !form.producesCard) return false;
  return (
    statusCode === "APPROVED" ||
    statusCode === "CARD_IN_PRODUCTION" ||
    statusCode === "CARD_MAILED"
  );
}

function alreadyHasStatus(
  actuals: Array<{ statusText: string }>,
  code: StatusCode,
): boolean {
  return actuals.some((event) => normalizeStatus(event.statusText).code === code);
}

function stageReached(current: StatusCode, expected: StatusCode): boolean {
  const order = POST_DECISION_CODES;
  const currentIndex = order.indexOf(current);
  const expectedIndex = order.indexOf(expected);
  if (currentIndex < 0 || expectedIndex < 0) return false;
  return currentIndex >= expectedIndex;
}

