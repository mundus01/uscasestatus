import { NextResponse } from "next/server";

import { deleteUserAccount } from "@/lib/account";
import { parseAccountDeleteConfirmation } from "@/lib/account-delete";
import { getClientIdentifier, rateLimit } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";

/**
 * DELETE /api/account
 * Requires a signed-in session + `{ confirm: true }` body.
 * Erases case_claims, tracked_cases for the user, then auth.users via service role.
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

  let user: { id: string; email?: string } | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user
      ? { id: data.user.id, email: data.user.email ?? undefined }
      : null;
  } catch {
    user = null;
  }

  if (!user?.email) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "unauthorized",
          message: "Sign in to delete your account.",
        },
      },
      { status: 401 },
    );
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const confirmation = parseAccountDeleteConfirmation(body);
  if (!confirmation.ok) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "confirmation_required", message: confirmation.message },
      },
      { status: 400 },
    );
  }

  const result = await deleteUserAccount({
    userId: user.id,
    email: user.email,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        data: null,
        error: { code: result.code, message: result.message },
      },
      { status: 502 },
    );
  }

  // Clear session cookies after the Auth user is gone.
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // User row is already deleted; cookie clear is best-effort.
  }

  return NextResponse.json({
    data: { deleted: true },
    error: null,
  });
}
