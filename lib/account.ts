import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; code: "upstream"; message: string };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Permanently erase a user's account-scoped data, then the Auth user.
 * Does not touch shared corpus tables (cases / case_events / lookups).
 */
export async function deleteUserAccount(input: {
  userId: string;
  email: string;
}): Promise<DeleteAccountResult> {
  const admin = createAdminClient();
  const email = normalizeEmail(input.email);

  const { error: claimsError } = await admin
    .from("case_claims")
    .delete()
    .eq("user_id", input.userId);

  if (claimsError) {
    return { ok: false, code: "upstream", message: claimsError.message };
  }

  // Remove alerts tied to this account (by user id and by account email).
  const { error: trackedByUserError } = await admin
    .from("tracked_cases")
    .delete()
    .eq("user_id", input.userId);

  if (trackedByUserError) {
    return { ok: false, code: "upstream", message: trackedByUserError.message };
  }

  if (email) {
    const { error: trackedByEmailError } = await admin
      .from("tracked_cases")
      .delete()
      .eq("email", email);

    if (trackedByEmailError) {
      return {
        ok: false,
        code: "upstream",
        message: trackedByEmailError.message,
      };
    }
  }

  const { error: authError } = await admin.auth.admin.deleteUser(input.userId);
  if (authError) {
    return { ok: false, code: "upstream", message: authError.message };
  }

  return { ok: true };
}

/** Clear filing details (case_claims) while keeping the account. */
export async function deleteUserCaseClaims(
  userId: string,
): Promise<DeleteAccountResult> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("case_claims")
    .delete()
    .eq("user_id", userId);

  if (error) {
    return { ok: false, code: "upstream", message: error.message };
  }

  return { ok: true };
}
