import { getForm } from "@/lib/forms";
import type { TimelineStep, TimelineStepId } from "@/lib/uscis/types";

const STEP_ORDER: TimelineStepId[] = [
  "received",
  "biometrics",
  "review",
  "interview",
  "decision",
  "card",
];

/**
 * Builds the typical path for a form, highlighting where the current status sits.
 */
export function buildTimeline(
  formType: string | null,
  currentStep: TimelineStepId,
): TimelineStep[] {
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

  // If the current status maps to a step this form skips, snap to the nearest
  // earlier step that exists on this path.
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
