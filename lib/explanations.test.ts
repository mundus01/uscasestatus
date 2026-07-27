import { describe, expect, it } from "vitest";

import {
  findExplanation,
  normalizeStatusKey,
  statusSlugFromText,
} from "./explanations";

describe("findExplanation", () => {
  it("matches exact status titles", () => {
    expect(findExplanation("Case Was Approved").slug).toBe("case_was_approved");
    expect(findExplanation("Request for Additional Evidence Was Sent").slug).toBe(
      "request_for_evidence_was_sent",
    );
  });

  it("is resilient to punctuation and casing", () => {
    expect(
      findExplanation("case was approved.").slug,
    ).toBe("case_was_approved");
  });

  it("falls back to unknown for unfamiliar text", () => {
    expect(findExplanation("Quantum Flux Recalibrated").slug).toBe("unknown");
  });
});

describe("status helpers", () => {
  it("normalizes keys", () => {
    expect(normalizeStatusKey("  Case Was  Approved! ")).toBe(
      "case was approved",
    );
  });

  it("builds slugs", () => {
    expect(statusSlugFromText("Case Was Approved")).toBe("case_was_approved");
  });
});
