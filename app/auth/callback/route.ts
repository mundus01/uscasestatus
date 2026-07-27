import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";

/**
 * Supabase magic-link callback (outside [locale] so the redirect URL is stable).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const site = publicEnv.siteUrl.replace(/\/$/, "");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${site}${next.startsWith("/") ? next : `/${next}`}`);
    }
  }

  return NextResponse.redirect(`${site}/sign-in?error=auth`);
}
