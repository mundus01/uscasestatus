import { describe, expect, it } from "vitest";

import { parseCaseClaimInput, safeNextPath } from "@/lib/claim-fields";

describe("parseCaseClaimInput", () => {
  it("accepts a valid receipt and filing fields", () => {
    const result = parseCaseClaimInput({
      receipt: "ioe0912345678",
      countryOfBirth: "Nigeria",
      premiumProcessing: "yes",
      visaCategory: "EB-1",
      serviceCenter: "TSC",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.receipt).toBe("IOE0912345678");
    expect(result.fields.countryOfBirth).toBe("Nigeria");
    expect(result.fields.premiumProcessing).toBe("yes");
  });

  it("rejects invalid receipts", () => {
    const result = parseCaseClaimInput({ receipt: "ABC123" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_receipt");
  });

  it("rejects invalid premium processing values", () => {
    const result = parseCaseClaimInput({
      receipt: "IOE0912345678",
      premiumProcessing: "maybe",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_field");
  });

  it("allows empty optional fields", () => {
    const result = parseCaseClaimInput({ receipt: "WAC2190012345" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.fields.countryOfBirth).toBeNull();
    expect(result.fields.premiumProcessing).toBeNull();
  });
});

describe("safeNextPath", () => {
  it("allows internal paths", () => {
    expect(safeNextPath("/case/IOE0912345678")).toBe("/case/IOE0912345678");
    expect(safeNextPath("/es/dashboard")).toBe("/es/dashboard");
  });

  it("blocks open redirects", () => {
    expect(safeNextPath("https://evil.com")).toBe("/dashboard");
    expect(safeNextPath("//evil.com")).toBe("/dashboard");
    expect(safeNextPath("case/IOE")).toBe("/dashboard");
  });

  it("uses the fallback when next is missing", () => {
    expect(safeNextPath(null, "/sign-in")).toBe("/sign-in");
  });
});
