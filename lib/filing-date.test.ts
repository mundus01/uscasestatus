import { describe, expect, it } from "vitest";

import { estimateFilingDateFromReceipt, receiptBlock } from "./filing-date";

describe("estimateFilingDateFromReceipt", () => {
  it("decodes a classic paper receipt into a fiscal-year date", () => {
    // FY21, day 001 → Oct 1, 2020
    const date = estimateFilingDateFromReceipt("WAC2100101234");
    expect(date?.toISOString().slice(0, 10)).toBe("2020-10-01");
  });

  it("returns null for IOE rather than guessing", () => {
    expect(estimateFilingDateFromReceipt("IOE0912345678")).toBeNull();
  });

  it("rejects impossible julian days", () => {
    expect(estimateFilingDateFromReceipt("WAC2199901234")).toBeNull();
  });
});

describe("receiptBlock", () => {
  it("keeps prefix + fiscal day digits only", () => {
    expect(receiptBlock("wac2100101234")).toBe("WAC21001");
  });
});
