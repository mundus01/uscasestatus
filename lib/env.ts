/**
 * Typed environment access. Server-only values are read lazily so that a
 * missing key fails at the call site with a clear message instead of crashing
 * the whole app at import time.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Add it to .env.local (see .env.example).`,
    );
  }
  return value;
}

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  // Empty string must not win over the production default (`??` only skips null/undefined).
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://uscasestatus.com",
};

export function requireSupabasePublicEnv() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL", publicEnv.supabaseUrl),
    anonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY", publicEnv.supabaseAnonKey),
  };
}

export function requireSupabaseServiceRoleKey() {
  return required(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getUpstashEnv() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

/**
 * Official USCIS Case Status API credentials.
 * Sandbox: https://api-int.uscis.gov — Production: https://api.uscis.gov
 * When unset, the app uses deterministic mock fixtures (local UI work).
 */
export function getUscisEnv() {
  const clientId = process.env.USCIS_CLIENT_ID;
  const clientSecret = process.env.USCIS_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const forceMock = process.env.USCIS_USE_MOCK === "true";
  if (forceMock) return null;

  return {
    clientId,
    clientSecret,
    baseUrl: (process.env.USCIS_API_BASE ?? "https://api-int.uscis.gov").replace(
      /\/$/,
      "",
    ),
  };
}

export function isUscisLiveConfigured(): boolean {
  return getUscisEnv() !== null;
}

/** Resend transactional email. Null when unset (local UI still works). */
export function getResendEnv() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    from:
      process.env.RESEND_FROM_EMAIL ??
      "uscasestatus.com <alerts@updates.uscasestatus.com>",
  };
}

/**
 * Shared secret for Vercel cron / internal jobs.
 * When unset in development, cron routes allow localhost-only calls.
 */
export function getCronSecret(): string | null {
  return process.env.CRON_SECRET ?? null;
}

/** Soft anti-abuse cap — product stays free; this is not a paid tier. */
export const MAX_TRACKED_CASES_PER_EMAIL = 25;
