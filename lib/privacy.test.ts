import { describe, expect, it } from "vitest";

import { MIN_CELL_SIZE, isSufficientSample } from "./privacy";

describe("isSufficientSample", () => {
  it("enforces the privacy cell floor of 25", () => {
    expect(MIN_CELL_SIZE).toBe(25);
    expect(isSufficientSample(24)).toBe(false);
    expect(isSufficientSample(25)).toBe(true);
    expect(isSufficientSample(0)).toBe(false);
    expect(isSufficientSample(Number.NaN)).toBe(false);
  });
});
