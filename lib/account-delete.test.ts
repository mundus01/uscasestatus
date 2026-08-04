import { describe, expect, it } from "vitest";

import {
  ACCOUNT_DELETE_PRESERVED_TABLES,
  ACCOUNT_DELETE_TABLES,
  parseAccountDeleteConfirmation,
} from "./account-delete";

describe("parseAccountDeleteConfirmation", () => {
  it("accepts confirm: true only", () => {
    expect(parseAccountDeleteConfirmation({ confirm: true })).toEqual({
      ok: true,
    });
  });

  it("rejects missing or false confirmation", () => {
    expect(parseAccountDeleteConfirmation(null).ok).toBe(false);
    expect(parseAccountDeleteConfirmation({}).ok).toBe(false);
    expect(parseAccountDeleteConfirmation({ confirm: false }).ok).toBe(false);
    expect(parseAccountDeleteConfirmation({ confirm: "yes" }).ok).toBe(false);
    expect(parseAccountDeleteConfirmation({ reason: "bye" }).ok).toBe(false);
  });
});

describe("account delete scope", () => {
  it("targets user-scoped tables and preserves corpus tables", () => {
    expect(ACCOUNT_DELETE_TABLES).toContain("case_claims");
    expect(ACCOUNT_DELETE_TABLES).toContain("tracked_cases");
    expect(ACCOUNT_DELETE_PRESERVED_TABLES).toEqual(
      expect.arrayContaining(["cases", "case_events", "lookups"]),
    );
    for (const table of ACCOUNT_DELETE_TABLES) {
      expect(ACCOUNT_DELETE_PRESERVED_TABLES).not.toContain(table);
    }
  });
});
