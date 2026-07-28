import { describe, expect, it } from "vitest";

import { computeElapsed, rangePosition } from "@/lib/forecast/elapsed";

describe("computeElapsed", () => {
  it("stops the clock at decision for an approved case (P0 regression)", () => {
    // Fixture mirrors sandbox EAC9999103402: submitted + modified 2023-09-05,
    // status "Case Approval Was Affirmed". Must NOT report ~34 months to "today".
    const receivedAt = new Date(Date.UTC(2023, 8, 5, 14, 28, 46));
    const decidedAt = new Date(Date.UTC(2023, 8, 5, 14, 28, 46));
    const now = new Date(Date.UTC(2026, 6, 27, 12, 0, 0));

    const elapsed = computeElapsed({
      receivedAt,
      decidedAt,
      isTerminal: true,
      now,
    });

    expect(elapsed.mode).toBe("decided");
    expect(elapsed.months).toBe(0);
    expect(elapsed.months).toBeLessThan(1);
  });

  it("continues accruing for pending cases", () => {
    const receivedAt = new Date(Date.UTC(2026, 0, 1));
    const now = new Date(Date.UTC(2026, 6, 1));

    const elapsed = computeElapsed({
      receivedAt,
      decidedAt: null,
      isTerminal: false,
      now,
    });

    expect(elapsed.mode).toBe("pending");
    expect(elapsed.months).toBeGreaterThan(5);
    expect(elapsed.months).toBeLessThan(7);
  });

  it("returns null months when start is unknown", () => {
    const elapsed = computeElapsed({
      receivedAt: null,
      decidedAt: null,
      isTerminal: false,
    });
    expect(elapsed.months).toBeNull();
  });
});

describe("rangePosition", () => {
  it("classifies under / within / over", () => {
    expect(rangePosition(2, 4, 10)).toBe("under");
    expect(rangePosition(6, 4, 10)).toBe("within");
    expect(rangePosition(12, 4, 10)).toBe("over");
    expect(rangePosition(null, 4, 10)).toBe("unknown");
  });
});
