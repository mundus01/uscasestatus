import { describe, expect, it } from "vitest";

import { normalizeFormType } from "./form-type";
import { getMockUscisCase } from "./mock";

describe("normalizeFormType", () => {
  it("normalizes common USCIS form strings", () => {
    expect(normalizeFormType("I-765")).toBe("I-765");
    expect(normalizeFormType("Form I-485")).toBe("I-485");
    expect(normalizeFormType("I765")).toBe("I-765");
    expect(normalizeFormType("N-400")).toBe("N-400");
  });

  it("returns null for empty values", () => {
    expect(normalizeFormType(null)).toBeNull();
    expect(normalizeFormType("")).toBeNull();
  });
});

describe("getMockUscisCase", () => {
  it("picks a scenario from the last digit and keeps the receipt", () => {
    const approved = getMockUscisCase("IOE0000000006");
    expect(approved.receiptNumber).toBe("IOE0000000006");
    expect(approved.statusText.en).toBe("Case Was Approved");

    const rfe = getMockUscisCase("WAC2190012343");
    expect(rfe.statusText.en).toBe("Request for Additional Evidence Was Sent");
  });
});
