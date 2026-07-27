import { describe, expect, it } from "vitest";

import { buildTimeline } from "./timeline";

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
