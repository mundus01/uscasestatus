import "server-only";

import {
  isPremiumProcessing,
  parseCaseClaimInput,
  type CaseClaimInput,
  type CaseClaimProfile,
} from "@/lib/claim-fields";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { validateReceipt } from "@/lib/receipt";

export type UpsertClaimResult =
  | { ok: true; profile: CaseClaimProfile }
  | {
      ok: false;
      code: "unauthorized" | "invalid_receipt" | "invalid_field" | "upstream";
      message: string;
    };

export type {
  CaseClaimInput,
  CaseClaimProfile,
  PremiumProcessing,
} from "@/lib/claim-fields";

export {
  COUNTRY_OF_BIRTH_OPTIONS,
  PREMIUM_PROCESSING_VALUES,
  SERVICE_CENTER_OPTIONS,
  VISA_CATEGORY_OPTIONS,
  parseCaseClaimInput,
  safeNextPath,
} from "@/lib/claim-fields";

function rowToProfile(row: {
  receipt: string;
  country_of_birth: string | null;
  premium_processing: string | null;
  visa_category: string | null;
  service_center: string | null;
  updated_at: string | null;
}): CaseClaimProfile {
  return {
    receipt: row.receipt,
    countryOfBirth: row.country_of_birth,
    premiumProcessing:
      row.premium_processing && isPremiumProcessing(row.premium_processing)
        ? row.premium_processing
        : null,
    visaCategory: row.visa_category,
    serviceCenter: row.service_center,
    updatedAt: row.updated_at,
  };
}

export async function getCaseClaimForUser(
  userId: string,
  receipt: string,
): Promise<CaseClaimProfile | null> {
  const validation = validateReceipt(receipt);
  if (!validation.ok) return null;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("case_claims")
      .select(
        "receipt, country_of_birth, premium_processing, visa_category, service_center, updated_at",
      )
      .eq("user_id", userId)
      .eq("receipt", validation.receipt)
      .maybeSingle();

    if (error || !data) {
      if (error) console.warn("[claims] get failed:", error.message);
      return null;
    }

    return rowToProfile(data);
  } catch (error) {
    console.warn(
      "[claims] get unavailable:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export async function listClaimsForUser(userId: string): Promise<CaseClaimProfile[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("case_claims")
      .select(
        "receipt, country_of_birth, premium_processing, visa_category, service_center, updated_at",
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.warn("[claims] list failed:", error.message);
      return [];
    }

    return (data ?? []).map(rowToProfile);
  } catch (error) {
    console.warn(
      "[claims] list unavailable:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

/**
 * Upsert filing details for the signed-in user.
 * Prefers the session client (RLS); falls back to admin when needed.
 */
export async function upsertCaseClaim(
  userId: string,
  input: CaseClaimInput,
): Promise<UpsertClaimResult> {
  const parsed = parseCaseClaimInput(input);
  if (!parsed.ok) {
    return { ok: false, code: parsed.code, message: parsed.message };
  }

  const payload = {
    user_id: userId,
    receipt: parsed.receipt,
    country_of_birth: parsed.fields.countryOfBirth,
    premium_processing: parsed.fields.premiumProcessing,
    visa_category: parsed.fields.visaCategory,
    service_center: parsed.fields.serviceCenter,
    updated_at: new Date().toISOString(),
  };

  try {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("case_claims")
        .upsert(payload, { onConflict: "user_id,receipt" })
        .select(
          "receipt, country_of_birth, premium_processing, visa_category, service_center, updated_at",
        )
        .single();

      if (!error && data) {
        return { ok: true, profile: rowToProfile(data) };
      }
      if (error) {
        console.warn("[claims] session upsert failed:", error.message);
      }
    } catch {
      // Fall through to admin client (local/misconfigured cookie path).
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("case_claims")
      .upsert(payload, { onConflict: "user_id,receipt" })
      .select(
        "receipt, country_of_birth, premium_processing, visa_category, service_center, updated_at",
      )
      .single();

    if (error || !data) {
      return {
        ok: false,
        code: "upstream",
        message: error?.message ?? "Could not save case details.",
      };
    }

    return { ok: true, profile: rowToProfile(data) };
  } catch (error) {
    return {
      ok: false,
      code: "upstream",
      message:
        error instanceof Error ? error.message : "Could not save case details.",
    };
  }
}
