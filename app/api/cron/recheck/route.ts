import { NextResponse } from "next/server";

import { checkCase } from "@/lib/check-case";
import { authorizeCronRequest } from "@/lib/cron-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Recheck confirmed tracked cases.
 * Persistence + alerts happen inside checkCase → upsertCaseFromCheck.
 * Keep `limit` modest for sandbox (1k/day quota).
 */
export async function GET(request: Request) {
  if (!authorizeCronRequest(request)) {
    return NextResponse.json(
      { data: null, error: { code: "unauthorized", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const limit = Math.min(
    Number(url.searchParams.get("limit") ?? "50") || 50,
    200,
  );

  const supabase = createAdminClient();
  const { data: tracked, error } = await supabase
    .from("tracked_cases")
    .select("receipt")
    .eq("confirmed", true)
    .order("updated_at", { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { data: null, error: { code: "upstream", message: error.message } },
      { status: 502 },
    );
  }

  const receipts = [...new Set((tracked ?? []).map((row) => row.receipt))];
  let checked = 0;
  let failed = 0;

  for (const receipt of receipts) {
    // Bypass Redis cache so cron always hits USCIS (sandbox/prod).
    const result = await checkCase(receipt, "en", { bypassCache: true });
    checked += 1;
    if (!result.ok) failed += 1;

    await supabase
      .from("tracked_cases")
      .update({ updated_at: new Date().toISOString() })
      .eq("receipt", receipt)
      .eq("confirmed", true);
  }

  return NextResponse.json({
    data: { checked, failed, receipts: receipts.length },
    error: null,
  });
}
