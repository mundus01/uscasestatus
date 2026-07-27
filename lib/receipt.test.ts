import { describe, expect, it } from "vitest";

import {
  formatReceipt,
  getServiceCenterName,
  isValidReceipt,
  normalizeReceipt,
  validateReceipt,
} from "./receipt";

describe("normalizeReceipt", () => {
  it("uppercases and strips separators and whitespace", () => {
    expect(normalizeReceipt(" ioe-09 1234.5678 ")).toBe("IOE0912345678");
  });
});

describe("validateReceipt", () => {
  it("accepts every documented prefix", () => {
    for (const prefix of ["IOE", "WAC", "EAC", "LIN", "SRC", "YSC", "NBC", "MSC"]) {
      const result = validateReceipt(`${prefix}0912345678`);
      expect(result.ok, prefix).toBe(true);
    }
  });

  it("accepts a receipt typed with separators", () => {
    const result = validateReceipt("ioe 09 123 45678");
    expect(result).toEqual({
      ok: true,
      receipt: "IOE0912345678",
      prefix: "IOE",
    });
  });

  it("reports an empty input", () => {
    expect(validateReceipt("   ")).toEqual({ ok: false, code: "empty", length: 0 });
  });

  it("reports an unknown prefix before the digits are complete", () => {
    expect(validateReceipt("XYZ09")).toEqual({
      ok: false,
      code: "badPrefix",
      length: 5,
      prefix: "XYZ",
    });
  });

  it("reports length with the count so the message can show it", () => {
    expect(validateReceipt("IOE091234")).toEqual({
      ok: false,
      code: "tooShort",
      length: 9,
    });
    expect(validateReceipt("IOE09123456789")).toEqual({
      ok: false,
      code: "tooLong",
      length: 14,
    });
  });

  it("rejects letters in the digit section", () => {
    expect(validateReceipt("IOE09123456AB")).toMatchObject({
      ok: false,
      code: "badFormat",
    });
  });

  it("is exposed as a boolean helper", () => {
    expect(isValidReceipt("WAC2190012345")).toBe(true);
    expect(isValidReceipt("WAC219001234")).toBe(false);
  });
});

describe("formatReceipt", () => {
  it("groups a valid receipt for reading", () => {
    expect(formatReceipt("IOE0912345678")).toBe("IOE 09 123 45678");
  });

  it("returns the normalized input when it cannot be grouped", () => {
    expect(formatReceipt("ioe091")).toBe("IOE091");
  });
});

describe("getServiceCenterName", () => {
  it("names documented service centers", () => {
    expect(getServiceCenterName("WAC2190012345")).toBe("California Service Center");
    expect(getServiceCenterName("IOE0912345678")).toBe("USCIS online filing (ELIS)");
  });

  it("returns null rather than guessing", () => {
    expect(getServiceCenterName("ZAR0912345678")).toBeNull();
    expect(getServiceCenterName("XYZ0912345678")).toBeNull();
  });
});
