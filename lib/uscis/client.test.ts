import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/env", () => ({
  getUscisEnv: vi.fn(),
}));

vi.mock("@/lib/uscis/auth", () => ({
  getUscisAccessToken: vi.fn(),
}));

import { getUscisEnv } from "@/lib/env";
import { getUscisAccessToken } from "@/lib/uscis/auth";
import { fetchUscisCase, messageFromUscisErrorBody } from "@/lib/uscis/client";

const getUscisEnvMock = vi.mocked(getUscisEnv);
const getUscisAccessTokenMock = vi.mocked(getUscisAccessToken);

describe("messageFromUscisErrorBody", () => {
  it("prefers errors[].message (RFC-9457)", () => {
    expect(
      messageFromUscisErrorBody(
        {
          errors: [
            {
              code: "RATE_LIMIT",
              message: "Daily quota exceeded for Case Status API.",
              status: "429",
              traceId: "abc-123",
            },
          ],
        },
        "fallback",
      ),
    ).toBe("Daily quota exceeded for Case Status API.");
  });

  it("joins multiple error messages", () => {
    expect(
      messageFromUscisErrorBody(
        {
          errors: [
            { message: "First problem." },
            { message: "Second problem." },
          ],
        },
        "fallback",
      ),
    ).toBe("First problem. Second problem.");
  });

  it("falls back to top-level message, then caller fallback", () => {
    expect(
      messageFromUscisErrorBody({ message: "Top-level only." }, "fallback"),
    ).toBe("Top-level only.");
    expect(messageFromUscisErrorBody({}, "fallback")).toBe("fallback");
    expect(messageFromUscisErrorBody(null, "fallback")).toBe("fallback");
  });
});

describe("fetchUscisCase error.message surfacing", () => {
  beforeEach(() => {
    getUscisEnvMock.mockReturnValue({
      clientId: "test-id",
      clientSecret: "test-secret",
      baseUrl: "https://api-int.uscis.gov",
    });
    getUscisAccessTokenMock.mockResolvedValue("test-token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("surfaces USCIS errors[].message on non-OK responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            errors: [
              {
                code: "CASE_NOT_FOUND",
                message: "No case exists for the provided receipt number.",
                category: "NOT_FOUND",
                status: "404",
                traceId: "trace-404",
              },
            ],
          }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const result = await fetchUscisCase("IOE0912345678");
    expect(result).toEqual({
      ok: false,
      code: "not_found",
      message: "No case exists for the provided receipt number.",
    });
  });

  it("surfaces USCIS errors[].message on upstream failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            errors: [
              {
                code: "THROTTLED",
                message: "Too many requests. Retry after 200 milliseconds.",
                status: "429",
                traceId: "trace-429",
              },
            ],
          }),
          { status: 429, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const result = await fetchUscisCase("IOE0912345678");
    expect(result).toEqual({
      ok: false,
      code: "upstream",
      message: "Too many requests. Retry after 200 milliseconds.",
    });
  });

  it("uses generic fallback when the error body has no message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("{}", {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const result = await fetchUscisCase("IOE0912345678");
    expect(result).toEqual({
      ok: false,
      code: "upstream",
      message: "USCIS returned HTTP 503.",
    });
  });
});
