import { publicEnv } from "@/lib/env";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalhostUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

/**
 * Canonical site origin for absolute auth redirects and emails.
 * In Vercel production, never fall back to a localhost Site URL misconfiguration.
 */
export function getSiteUrl(request?: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (process.env.VERCEL_ENV === "production") {
    if (configured && !isLocalhostUrl(configured)) {
      return stripTrailingSlash(configured);
    }
    return "https://uscasestatus.com";
  }

  if (configured) {
    return stripTrailingSlash(configured);
  }

  if (process.env.VERCEL_URL) {
    return `https://${stripTrailingSlash(process.env.VERCEL_URL)}`;
  }

  if (request) {
    return new URL(request.url).origin;
  }

  return stripTrailingSlash(publicEnv.siteUrl);
}

/** Supabase emailRedirectTo / OAuth redirectTo target. */
export function authCallbackUrl(site: string, next: string): string {
  const origin = stripTrailingSlash(site);
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
