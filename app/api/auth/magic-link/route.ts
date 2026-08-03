import { NextResponse } from "next/server";

import { safeNextPath } from "@/lib/claim-fields";
import { publicEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIdentifier, rateLimit } from "@/lib/ratelimit";
import { isLocale } from "@/i18n/routing";

type Body = { email?: string; locale?: string; next?: string };

export async function POST(request: Request) {
  const limit = await rateLimit("track", getClientIdentifier(request.headers));
  if (!limit.success) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "rate_limited", message: "Too many requests." },
      },
      { status: 429 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { data: null, error: { code: "invalid_body", message: "Expected JSON." } },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "invalid_email", message: "Enter a valid email." },
      },
      { status: 400 },
    );
  }

  const locale = body.locale && isLocale(body.locale) ? body.locale : "en";
  const site = publicEnv.siteUrl.replace(/\/$/, "");
  const defaultNext = locale === "en" ? "/dashboard" : `/${locale}/dashboard`;
  const next = safeNextPath(body.next, defaultNext);
  const redirectTo = `${site}/auth/callback?next=${encodeURIComponent(next)}`;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    if (error) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "upstream", message: error.message },
        },
        { status: 502 },
      );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Auth is not configured.";
    return NextResponse.json(
      { data: null, error: { code: "upstream", message } },
      { status: 502 },
    );
  }

  return NextResponse.json({ data: { sent: true }, error: null });
}
