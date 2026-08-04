import { afterEach, describe, expect, it, vi } from "vitest";

import { authCallbackUrl, getSiteUrl } from "@/lib/site-url";

describe("getSiteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses NEXT_PUBLIC_SITE_URL when set outside production", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("VERCEL_ENV", "");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("ignores localhost Site URL on Vercel production", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(getSiteUrl()).toBe("https://uscasestatus.com");
  });

  it("keeps a production Site URL on Vercel production", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://uscasestatus.com/");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(getSiteUrl()).toBe("https://uscasestatus.com");
  });

  it("falls back to the request origin in local/dev without env", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("VERCEL_URL", "");
    const request = new Request("http://127.0.0.1:3000/api/auth/magic-link");
    expect(getSiteUrl(request)).toBe("http://127.0.0.1:3000");
  });
});

describe("authCallbackUrl", () => {
  it("builds a stable callback with encoded next", () => {
    expect(authCallbackUrl("https://uscasestatus.com/", "/es/dashboard")).toBe(
      "https://uscasestatus.com/auth/callback?next=%2Fes%2Fdashboard",
    );
  });
});
