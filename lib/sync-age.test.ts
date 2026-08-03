import { describe, expect, it } from "vitest";

import { syncAgeFromTimestamp } from "./sync-age";

describe("syncAgeFromTimestamp", () => {
  const now = new Date("2026-08-03T18:00:00.000Z");

  it("returns never for missing or invalid timestamps", () => {
    expect(syncAgeFromTimestamp(null, now)).toEqual({ kind: "never" });
    expect(syncAgeFromTimestamp(undefined, now)).toEqual({ kind: "never" });
    expect(syncAgeFromTimestamp("not-a-date", now)).toEqual({ kind: "never" });
  });

  it("returns just_now under one minute", () => {
    expect(
      syncAgeFromTimestamp("2026-08-03T17:59:30.000Z", now),
    ).toEqual({ kind: "just_now" });
  });

  it("returns minutes under one hour", () => {
    expect(
      syncAgeFromTimestamp("2026-08-03T17:48:00.000Z", now),
    ).toEqual({ kind: "minutes", minutes: 12 });
  });

  it("returns hours under 48 hours", () => {
    expect(
      syncAgeFromTimestamp("2026-08-03T15:00:00.000Z", now),
    ).toEqual({ kind: "hours", hours: 3 });
  });

  it("returns days for older timestamps", () => {
    expect(
      syncAgeFromTimestamp("2026-07-30T18:00:00.000Z", now),
    ).toEqual({ kind: "days", days: 4 });
  });
});
