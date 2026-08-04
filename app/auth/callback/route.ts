import { NextResponse } from "next/server";

import { safeNextPath } from "@/lib/claim-fields";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase auth callback (outside [locale] so redirect URLs stay stable).
 * Handles the PKCE `?code=` flow used by magic links, email confirm, and OAuth.
 * Hash tokens (`#access_token=`) are handled client-side by AuthHashHandler.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");
  const next = safeNextPath(url.searchParams.get("next"), "/dashboard");
  const origin = url.origin;

  if (oauthError) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=auth&next=${encodeURIComponent(next)}`, origin),
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(
    new URL(`/sign-in?error=auth&next=${encodeURIComponent(next)}`, origin),
  );
}
