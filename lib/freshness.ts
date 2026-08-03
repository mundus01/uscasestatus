import { getRedis } from "@/lib/redis";
import { createAdminClient } from "@/lib/supabase/admin";

export const REFRESH_COOLDOWN_MS = 60_000;
export const FRESH_MS = 6 * 60 * 60 * 1000;
export const STALE_MS = 24 * 60 * 60 * 1000;

export type { SyncAge } from "@/lib/sync-age";
export { syncAgeFromTimestamp } from "@/lib/sync-age";

export type FreshnessState = "fresh" | "stale" | "checking";

export type FreshnessInfo = {
  lastCheckedAt: string;
  isStale: boolean;
  state: FreshnessState;
  nextRefreshAvailableAt: string;
};

const COOLDOWN_PREFIX = "refresh-cooldown:";

export function buildFreshnessInfo(input: {
  lastCheckedAt: string;
  isStale?: boolean;
  nextRefreshAvailableAt?: string | null;
  now?: Date;
}): FreshnessInfo {
  const now = input.now ?? new Date();
  const last = new Date(input.lastCheckedAt).getTime();
  const ageMs = Number.isFinite(last) ? now.getTime() - last : 0;
  const isStale = input.isStale ?? ageMs > STALE_MS;

  let state: FreshnessState = "fresh";
  if (isStale || ageMs > STALE_MS) {
    state = "stale";
  } else if (ageMs < FRESH_MS) {
    state = "fresh";
  } else {
    state = "fresh"; // between 6h and 24h: still show checked time, not amber stale
  }

  const nextRefreshAvailableAt =
    input.nextRefreshAvailableAt ??
    new Date(now.getTime()).toISOString();

  return {
    lastCheckedAt: input.lastCheckedAt,
    isStale,
    state: isStale ? "stale" : state,
    nextRefreshAvailableAt,
  };
}

export async function getRefreshCooldownUntil(
  receipt: string,
): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const value = await redis.get<string>(`${COOLDOWN_PREFIX}${receipt}`);
    return value ?? null;
  } catch {
    return null;
  }
}

export async function setRefreshCooldown(
  receipt: string,
  untilIso: string,
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(`${COOLDOWN_PREFIX}${receipt}`, untilIso, {
      ex: Math.ceil(REFRESH_COOLDOWN_MS / 1000),
    });
  } catch (error) {
    console.warn("[freshness] cooldown set failed:", error);
  }
}

/**
 * Most recent successful case check across the corpus (`cases.last_checked`).
 * Returns null when Supabase is unavailable or the corpus is empty.
 */
export async function getLastCorpusSyncAt(): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("cases")
      .select("last_checked")
      .order("last_checked", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data?.last_checked) return null;
    return typeof data.last_checked === "string"
      ? data.last_checked
      : new Date(data.last_checked).toISOString();
  } catch {
    return null;
  }
}
