import { NextResponse } from "next/server";

import { deleteUserCaseClaims } from "@/lib/account";
import { getClientIdentifier, rateLimit } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";

/**
 * DELETE /api/account/claims
 * Clears filing details (case_claims) for the signed-in user; keeps the account.
 */
export async function DELETE(request: Request) {
  const limit = await rateLimit("track", getClientIdentifier(request.headers));
  if (!limit.success) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "rate_limited",
          message: "Too many requests. Try again later.",
        },
      },
      { status: 429 },
    );
  }

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    userId = null;
  }

  if (!userId) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "unauthorized",
          message: "Sign in to delete case details.",
        },
      },
      { status: 401 },
    );
  }

  const result = await deleteUserCaseClaims(userId);
  if (!result.ok) {
    return NextResponse.json(
      {
        data: null,
        error: { code: result.code, message: result.message },
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ data: { deleted: true }, error: null });
}
