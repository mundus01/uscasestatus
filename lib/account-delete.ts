/**
 * Pure helpers for account deletion (testable without Supabase).
 *
 * Privacy policy (public/privacy.html § Deleting your data):
 * two clicks from Settings, no email/reason required; live systems cleared
 * promptly; backups age out (~35 days); production erasure within 30 days.
 */

/** User-scoped rows removed on full account deletion. */
export const ACCOUNT_DELETE_TABLES = [
  "case_claims",
  "tracked_cases",
] as const;

/**
 * Shared / anonymized tables that are intentionally NOT wiped for one user.
 * Status transitions already in block-level counts stay per the privacy policy.
 */
export const ACCOUNT_DELETE_PRESERVED_TABLES = [
  "cases",
  "case_events",
  "lookups",
] as const;

export type AccountDeleteBody = {
  confirm?: unknown;
};

/**
 * Second-click confirmation from the settings UI.
 * Requires `{ confirm: true }` — no free-text reason.
 */
export function parseAccountDeleteConfirmation(
  body: unknown,
): { ok: true } | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Confirmation required." };
  }

  const confirm = (body as AccountDeleteBody).confirm;
  if (confirm !== true) {
    return { ok: false, message: "Confirmation required." };
  }

  return { ok: true };
}
