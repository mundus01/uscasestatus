import { NextResponse } from "next/server";

import { checkCase } from "@/lib/check-case";
import { authorizeCronRequest } from "@/lib/cron-auth";
import { neighborCandidates } from "@/lib/neighbors";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Sample nearby receipts around confirmed tracked cases.
 * Keep limits low on sandbox (1k/day). Raise after production access.
 */
export async function GET(request: Request) {
  if (!authorizeCronRequest(request)) {
    return NextResponse.json(
      { data: null, error: { code: "unauthorized", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const seeds = Math.min(Number(url.searchParams.get("seeds") ?? "5") || 5, 20);
  const perSeed = Math.min(
    Number(url.searchParams.get("perSeed") ?? "10") || 10,
    40,
  );

  const supabase = createAdminClient();
  const { data: tracked, error } = await supabase
    .from("tracked_cases")
    .select("receipt")
    .eq("confirmed", true)
    .order("updated_at", { ascending: false })
    .limit(seeds);

  if (error) {
    return NextResponse.json(
      { data: null, error: { code: "upstream", message: error.message } },
      { status: 502 },
    );
  }

  let attempted = 0;
  let found = 0;
  let failed = 0;

  for (const row of tracked ?? []) {
    const candidates = neighborCandidates(row.receipt, 40);
    // Prefer candidates we haven't stored yet.
    const { data: existing } = await supabase
      .from("cases")
      .select("receipt")
      .in("receipt", candidates);

    const known = new Set((existing ?? []).map((item) => item.receipt));
    const unknown = candidates.filter((receipt) => !known.has(receipt));
    const sample = unknown.slice(0, perSeed);

    for (const receipt of sample) {
      attempted += 1;
      const result = await checkCase(receipt, "en", { bypassCache: true });
      if (result.ok) found += 1;
      else failed += 1;
    }
  }

  return NextResponse.json({
    data: { seeds: tracked?.length ?? 0, attempted, found, failed },
    error: null,
  });
}
