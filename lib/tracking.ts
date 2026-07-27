import "server-only";

import { randomBytes } from "node:crypto";

import { MAX_TRACKED_CASES_PER_EMAIL } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendConfirmTrackEmail } from "@/lib/email";
import { validateReceipt } from "@/lib/receipt";
import type { Locale } from "@/i18n/routing";
import { isLocale } from "@/i18n/routing";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function newToken(): string {
  return randomBytes(24).toString("hex");
}

export type TrackRequestResult =
  | { ok: true; alreadyTracked: boolean; needsConfirmation: boolean }
  | {
      ok: false;
      code:
        | "invalid_receipt"
        | "invalid_email"
        | "limit_reached"
        | "upstream"
        | "email_failed";
      message: string;
    };

/**
 * Start tracking a receipt by email. Sends a confirm link unless already confirmed.
 */
export async function requestTrackCase(input: {
  receipt: string;
  email: string;
  locale: string;
  userId?: string | null;
}): Promise<TrackRequestResult> {
  const validation = validateReceipt(input.receipt);
  if (!validation.ok) {
    return {
      ok: false,
      code: "invalid_receipt",
      message: "Enter a valid USCIS receipt number.",
    };
  }

  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) {
    return {
      ok: false,
      code: "invalid_email",
      message: "Enter a valid email address.",
    };
  }

  const locale: Locale = isLocale(input.locale) ? input.locale : "en";
  const supabase = createAdminClient();
  const receipt = validation.receipt;

  const { count, error: countError } = await supabase
    .from("tracked_cases")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .eq("confirmed", true);

  if (countError) {
    return { ok: false, code: "upstream", message: countError.message };
  }

  const { data: existing } = await supabase
    .from("tracked_cases")
    .select("id, confirmed, confirm_token")
    .eq("email", email)
    .eq("receipt", receipt)
    .maybeSingle();

  if (existing?.confirmed) {
    return { ok: true, alreadyTracked: true, needsConfirmation: false };
  }

  if (!existing && (count ?? 0) >= MAX_TRACKED_CASES_PER_EMAIL) {
    return {
      ok: false,
      code: "limit_reached",
      message: `You can track up to ${MAX_TRACKED_CASES_PER_EMAIL} cases per email.`,
    };
  }

  const confirmToken = newToken();
  const unsubscribeToken = newToken();

  if (existing) {
    const { error } = await supabase
      .from("tracked_cases")
      .update({
        confirm_token: confirmToken,
        locale,
        user_id: input.userId ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      return { ok: false, code: "upstream", message: error.message };
    }
  } else {
    const { error } = await supabase.from("tracked_cases").insert({
      receipt,
      email,
      locale,
      user_id: input.userId ?? null,
      confirmed: false,
      confirm_token: confirmToken,
      unsubscribe_token: unsubscribeToken,
      channels: { email: true },
    });

    if (error) {
      return { ok: false, code: "upstream", message: error.message };
    }
  }

  const sent = await sendConfirmTrackEmail({
    to: email,
    receipt,
    confirmToken,
    locale,
  });

  // In local dev without Resend, still create the row so confirm can be tested
  // via the token in the DB — but surface that email wasn't sent.
  if (!sent.ok && sent.reason !== "email_not_configured") {
    return { ok: false, code: "email_failed", message: sent.reason };
  }

  return {
    ok: true,
    alreadyTracked: false,
    needsConfirmation: true,
  };
}

export async function confirmTrackCase(
  token: string,
): Promise<{ ok: true; receipt: string; email: string } | { ok: false }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tracked_cases")
    .select("id, receipt, email")
    .eq("confirm_token", token)
    .maybeSingle();

  if (error || !data) return { ok: false };

  const { error: updateError } = await supabase
    .from("tracked_cases")
    .update({
      confirmed: true,
      confirm_token: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  if (updateError) return { ok: false };

  return { ok: true, receipt: data.receipt, email: data.email };
}

export async function unsubscribeTrackCase(
  token: string,
): Promise<{ ok: true } | { ok: false }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tracked_cases")
    .select("id")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (error || !data) return { ok: false };

  const { error: deleteError } = await supabase
    .from("tracked_cases")
    .delete()
    .eq("id", data.id);

  return deleteError ? { ok: false } : { ok: true };
}

export async function listTrackedForUser(userId: string, email: string) {
  const supabase = createAdminClient();

  // Link any confirmed email tracks to this user on dashboard load.
  await supabase
    .from("tracked_cases")
    .update({ user_id: userId, updated_at: new Date().toISOString() })
    .eq("email", normalizeEmail(email))
    .is("user_id", null);

  const { data, error } = await supabase
    .from("tracked_cases")
    .select(
      "id, receipt, nickname, locale, confirmed, created_at, last_alerted_status",
    )
    .or(`user_id.eq.${userId},email.eq.${normalizeEmail(email)}`)
    .eq("confirmed", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[tracking] list failed:", error.message);
    return [];
  }

  const rows = data ?? [];
  if (rows.length === 0) return [];

  const receipts = rows.map((row) => row.receipt);
  const { data: caseRows } = await supabase
    .from("cases")
    .select("receipt, last_status, form_type, last_checked")
    .in("receipt", receipts);

  const byReceipt = new Map(
    (caseRows ?? []).map((row) => [row.receipt, row] as const),
  );

  return rows.map((row) => ({
    ...row,
    caseRow: byReceipt.get(row.receipt) ?? null,
  }));
}
