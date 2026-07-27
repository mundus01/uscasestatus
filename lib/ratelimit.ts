import "server-only";

import { Ratelimit } from "@upstash/ratelimit";

import { getRedis } from "@/lib/redis";

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  /** Epoch ms when the current window resets. */
  reset: number;
};

type LimiterName = "check" | "track";

const WINDOWS: Record<LimiterName, { tokens: number; window: `${number} ${"s" | "m" | "h"}` }> = {
  // Generous enough for anxious refreshing, tight enough to protect USCIS.
  check: { tokens: 20, window: "10 m" },
  track: { tokens: 10, window: "1 h" },
};

const limiters = new Map<LimiterName, Ratelimit>();

function getLimiter(name: LimiterName): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const existing = limiters.get(name);
  if (existing) return existing;

  const { tokens, window } = WINDOWS[name];
  const limiter = new Ratelimit({
    redis,
    prefix: `ratelimit:${name}`,
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: false,
  });

  limiters.set(name, limiter);
  return limiter;
}

/**
 * Rate limits an identifier (usually a hashed IP). When Upstash is not
 * configured the request is allowed through, so local development works without
 * credentials — production sets the env vars.
 */
export async function rateLimit(
  name: LimiterName,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getLimiter(name);
  const { tokens } = WINDOWS[name];

  if (!limiter) {
    return {
      success: true,
      limit: tokens,
      remaining: tokens,
      reset: Date.now(),
    };
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  return { success, limit, remaining, reset };
}

/** Derives a rate-limit identifier from proxy headers. */
export function getClientIdentifier(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip");
  return ip || "unknown";
}
