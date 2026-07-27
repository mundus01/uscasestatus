import "server-only";

import { getRedis } from "@/lib/redis";
import type { UscisCasePayload } from "@/lib/uscis/types";

const CACHE_TTL_SECONDS = 45 * 60; // 45 minutes — matches plan's 30–60 min window
const KEY_PREFIX = "case:";

export async function getCachedCase(
  receipt: string,
): Promise<UscisCasePayload | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const value = await redis.get<UscisCasePayload>(`${KEY_PREFIX}${receipt}`);
    return value ?? null;
  } catch (error) {
    console.warn("[case-cache] get failed:", error);
    return null;
  }
}

export async function setCachedCase(
  receipt: string,
  payload: UscisCasePayload,
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set(`${KEY_PREFIX}${receipt}`, payload, {
      ex: CACHE_TTL_SECONDS,
    });
  } catch (error) {
    console.warn("[case-cache] set failed:", error);
  }
}
