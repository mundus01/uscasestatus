import { describe, expect, it } from "vitest";

import { getNextSteps, nextStepsBordered, nextStepsTone } from "./next-steps";

describe("getNextSteps", () => {
  it("returns distinct RFE steps", () => {
    const steps = getNextSteps("RFE_SENT", "en", "Cite");
    expect(steps.items.length).toBeGreaterThanOrEqual(2);
    expect(steps.citationHref).toContain("uscis.gov");
  });

  it("returns sober denial steps without citation requirement", () => {
    const steps = getNextSteps("DENIED", "en", "Cite");
    expect(steps.items.some((item) => /denial/i.test(item))).toBe(true);
  });

  it("maps severity to callout treatment", () => {
    expect(nextStepsTone("positive")).toBe("approved");
    expect(nextStepsTone("action_required")).toBe("pending");
    expect(nextStepsTone("negative")).toBe("neutral");
    expect(nextStepsBordered("action_required")).toBe(true);
  });
});
