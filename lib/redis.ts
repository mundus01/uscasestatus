import "server-only";

import { Redis } from "@upstash/redis";

import { getUpstashEnv } from "@/lib/env";

let cached: Redis | null | undefined;

/**
 * Shared Upstash client, or `null` when Upstash is not configured (local dev).
 * Callers must treat a missing cache as a cache miss rather than an error.
 */
export function getRedis(): Redis | null {
  if (cached !== undefined) return cached;

  const env = getUpstashEnv();
  cached = env ? new Redis({ url: env.url, token: env.token }) : null;
  return cached;
}
