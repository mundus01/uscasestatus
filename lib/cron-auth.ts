import "server-only";

import { getCronSecret } from "@/lib/env";

/**
 * Authorize Vercel cron / internal job requests.
 * Prefers `Authorization: Bearer $CRON_SECRET`.
 * In local dev without a secret, allows the request (so `curl` works).
 */
export function authorizeCronRequest(request: Request): boolean {
  const secret = getCronSecret();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;

  // Vercel Cron sends this header on scheduled invocations.
  const cronHeader = request.headers.get("x-vercel-cron");
  if (cronHeader === "1" && secret) {
    // Still require bearer when secret is set — Vercel can be configured to send it.
    return header === `Bearer ${secret}`;
  }

  return false;
}
