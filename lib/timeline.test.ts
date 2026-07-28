import { describe, expect, it } from "vitest";

import { buildCaseTimeline, buildTimeline } from "./timeline";

describe("buildTimeline", () => {
  it("includes biometrics and interview for I-485", () => {
    const steps = buildTimeline("I-485", "review");
    expect(steps.map((step) => step.id)).toEqual([
      "received",
      "biometrics",
      "review",
      "interview",
      "decision",
      "card",
    ]);
    expect(steps.find((step) => step.id === "review")?.state).toBe("current");
    expect(steps.find((step) => step.id === "received")?.state).toBe("complete");
    expect(steps.find((step) => step.id === "interview")?.state).toBe(
      "upcoming",
    );
  });

  it("skips interview for I-765", () => {
    const steps = buildTimeline("I-765", "card");
    expect(steps.map((step) => step.id)).toEqual([
      "received",
      "biometrics",
      "review",
      "decision",
      "card",
    ]);
    expect(steps.at(-1)?.state).toBe("current");
  });
});

describe("buildCaseTimeline", () => {
  it("synthesizes dated events and shows post-decision path when approved", () => {
    const model = buildCaseTimeline({
      formType: "I-765",
      currentStep: "decision",
      currentStatusText: "Case Was Approved",
      statusCode: "APPROVED",
      isTerminal: true,
      submittedDate: "09-05-2023 14:28:46",
      modifiedDate: "09-05-2023 14:28:46",
      history: [],
      trackingStartedAt: "2026-07-27T12:00:00.000Z",
    });

    // Approved card forms keep post-decision expected stages, not interview/etc.
    expect(model.nodes.some((node) => node.kind === "expected")).toBe(true);
    expect(
      model.nodes.some(
        (node) => node.kind === "expected" && node.stageId === "interview",
      ),
    ).toBe(false);
    expect(
      model.nodes
        .filter((node) => node.kind !== "expected")
        .every((node) => node.dateIso != null),
    ).toBe(true);
  });

  it("keeps expected stages for pending cases", () => {
    const model = buildCaseTimeline({
      formType: "I-130",
      currentStep: "review",
      currentStatusText: "Case Is Being Actively Reviewed By USCIS",
      statusCode: "ACTIVELY_REVIEWING",
      isTerminal: false,
      submittedDate: "11-02-2024 11:00:00",
      modifiedDate: "04-18-2026 08:45:00",
      history: [],
      trackingStartedAt: "2026-07-27T12:00:00.000Z",
    });

    expect(model.nodes.some((node) => node.kind === "expected")).toBe(true);
    expect(model.nodes.at(-1)?.kind).toBe("expected");
  });
});
