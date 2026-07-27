import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { validateReceipt } from "@/lib/receipt";

export type NearbySummary = {
  sampleSize: number;
  approved: number;
  pending: number;
  alert: number;
  other: number;
  /** Share approved 0–1 among classified rows. */
  approvedRate: number | null;
};

function classifyStatus(status: string): "approved" | "pending" | "alert" | "other" {
  const s = status.toLowerCase();
  if (s.includes("approv") || s.includes("card was mail") || s.includes("produced")) {
    return "approved";
  }
  if (
    s.includes("denied") ||
    s.includes("request for evidence") ||
    s.includes("rfe") ||
    s.includes("reject")
  ) {
    return "alert";
  }
  if (
    s.includes("received") ||
    s.includes("review") ||
    s.includes("fingerprint") ||
    s.includes("biometric") ||
    s.includes("interview") ||
    s.includes("transfer")
  ) {
    return "pending";
  }
  return "other";
}

/**
 * Nearby cases = same 8-char receipt block already in our corpus.
 * Grows as lookups + neighbor sampling fill `cases`.
 */
export async function getNearbySummary(
  receipt: string,
): Promise<NearbySummary | null> {
  const validation = validateReceipt(receipt);
  if (!validation.ok) return null;

  const block = validation.receipt.slice(0, 8);

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("cases")
      .select("last_status")
      .like("receipt", `${block}%`)
      .limit(1000);

    if (error || !data?.length) return null;

    let approved = 0;
    let pending = 0;
    let alert = 0;
    let other = 0;

    for (const row of data) {
      const bucket = classifyStatus(row.last_status);
      if (bucket === "approved") approved += 1;
      else if (bucket === "pending") pending += 1;
      else if (bucket === "alert") alert += 1;
      else other += 1;
    }

    const sampleSize = data.length;
    const classified = approved + pending + alert;
    return {
      sampleSize,
      approved,
      pending,
      alert,
      other,
      approvedRate: classified > 0 ? approved / classified : null,
    };
  } catch {
    return null;
  }
}

/** Generate candidate neighbor receipts around a seed (same block). */
export function neighborCandidates(
  receipt: string,
  radius = 25,
): string[] {
  const validation = validateReceipt(receipt);
  if (!validation.ok) return [];

  const prefix = validation.receipt.slice(0, 3);
  const serial = Number(validation.receipt.slice(3));
  if (!Number.isFinite(serial)) return [];

  const out: string[] = [];
  for (let delta = -radius; delta <= radius; delta += 1) {
    if (delta === 0) continue;
    const next = serial + delta;
    if (next < 0 || next > 9_999_999_999) continue;
    out.push(`${prefix}${String(next).padStart(10, "0")}`);
  }
  return out;
}
