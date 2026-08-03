import { validateReceipt } from "@/lib/receipt";

export const PREMIUM_PROCESSING_VALUES = ["yes", "no", "unknown"] as const;
export type PremiumProcessing = (typeof PREMIUM_PROCESSING_VALUES)[number];

export const COUNTRY_OF_BIRTH_OPTIONS = [
  "Nigeria",
  "India",
  "China",
  "Brazil",
  "Pakistan",
  "Mexico",
  "Philippines",
  "Other",
] as const;

export const VISA_CATEGORY_OPTIONS = [
  { value: "EB-1", labelKey: "visaEb1" },
  { value: "EB-2 NIW", labelKey: "visaEb2Niw" },
  { value: "EB-2", labelKey: "visaEb2" },
  { value: "EB-3", labelKey: "visaEb3" },
  { value: "family", labelKey: "visaFamily" },
  { value: "other", labelKey: "visaOther" },
  { value: "unknown", labelKey: "visaUnknown" },
] as const;

export const SERVICE_CENTER_OPTIONS = [
  { value: "TSC", labelKey: "centerTsc" },
  { value: "NSC", labelKey: "centerNsc" },
  { value: "CSC", labelKey: "centerCsc" },
  { value: "VSC", labelKey: "centerVsc" },
  { value: "PSC", labelKey: "centerPsc" },
  { value: "NBC", labelKey: "centerNbc" },
  { value: "online", labelKey: "centerOnline" },
  { value: "unknown", labelKey: "centerUnknown" },
] as const;

export type CaseClaimProfile = {
  receipt: string;
  countryOfBirth: string | null;
  premiumProcessing: PremiumProcessing | null;
  visaCategory: string | null;
  serviceCenter: string | null;
  updatedAt: string | null;
};

export type CaseClaimInput = {
  receipt: string;
  countryOfBirth?: string | null;
  premiumProcessing?: string | null;
  visaCategory?: string | null;
  serviceCenter?: string | null;
};

export function isPremiumProcessing(value: string): value is PremiumProcessing {
  return (PREMIUM_PROCESSING_VALUES as readonly string[]).includes(value);
}

function normalizeOptional(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Validate claim fields without touching the database (unit-testable). */
export function parseCaseClaimInput(
  input: CaseClaimInput,
):
  | {
      ok: true;
      receipt: string;
      fields: Omit<CaseClaimProfile, "receipt" | "updatedAt">;
    }
  | { ok: false; code: "invalid_receipt" | "invalid_field"; message: string } {
  const validation = validateReceipt(input.receipt);
  if (!validation.ok) {
    return {
      ok: false,
      code: "invalid_receipt",
      message: "Enter a valid USCIS receipt number.",
    };
  }

  const countryOfBirth = normalizeOptional(input.countryOfBirth);
  const visaCategory = normalizeOptional(input.visaCategory);
  const serviceCenter = normalizeOptional(input.serviceCenter);
  const premiumRaw = normalizeOptional(input.premiumProcessing);

  let premiumProcessing: PremiumProcessing | null = null;
  if (premiumRaw) {
    if (!isPremiumProcessing(premiumRaw)) {
      return {
        ok: false,
        code: "invalid_field",
        message: "Premium processing must be yes, no, or unknown.",
      };
    }
    premiumProcessing = premiumRaw;
  }

  if (countryOfBirth && countryOfBirth.length > 80) {
    return {
      ok: false,
      code: "invalid_field",
      message: "Country of birth is too long.",
    };
  }

  if (visaCategory && visaCategory.length > 80) {
    return {
      ok: false,
      code: "invalid_field",
      message: "Visa category is too long.",
    };
  }

  if (serviceCenter && serviceCenter.length > 80) {
    return {
      ok: false,
      code: "invalid_field",
      message: "Service center is too long.",
    };
  }

  return {
    ok: true,
    receipt: validation.receipt,
    fields: {
      countryOfBirth,
      premiumProcessing,
      visaCategory,
      serviceCenter,
    },
  };
}

/** Safe internal redirect paths only (blocks open redirects). */
export function safeNextPath(
  next: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!next) return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  return trimmed;
}
