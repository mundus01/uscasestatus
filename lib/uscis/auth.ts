import "server-only";

import { getUscisEnv } from "@/lib/env";

type TokenCache = {
  accessToken: string;
  /** Epoch ms when we should refresh (slightly before real expiry). */
  expiresAt: number;
};

let cache: TokenCache | null = null;
let inflight: Promise<string> | null = null;

type TokenResponse = {
  access_token?: string;
  expires_in?: string | number;
};

/**
 * Returns a valid USCIS OAuth access token, refreshing when needed.
 * Tokens last ~30 minutes; we refresh 60s early.
 */
export async function getUscisAccessToken(): Promise<string> {
  const env = getUscisEnv();
  if (!env) {
    throw new Error("USCIS credentials are not configured");
  }

  if (cache && Date.now() < cache.expiresAt) {
    return cache.accessToken;
  }

  if (inflight) return inflight;

  inflight = requestToken(env.baseUrl, env.clientId, env.clientSecret)
    .then((token) => {
      cache = token;
      return token.accessToken;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

async function requestToken(
  baseUrl: string,
  clientId: string,
  clientSecret: string,
): Promise<TokenCache> {
  const response = await fetch(`${baseUrl}/oauth/accesstoken`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`USCIS OAuth failed with HTTP ${response.status}`);
  }

  const json = (await response.json()) as TokenResponse;
  if (!json.access_token) {
    throw new Error("USCIS OAuth response missing access_token");
  }

  const expiresInSec = Number(json.expires_in ?? 1799);
  const refreshBufferMs = 60_000;

  return {
    accessToken: json.access_token,
    expiresAt: Date.now() + Math.max(expiresInSec * 1000 - refreshBufferMs, 30_000),
  };
}

/** Test helper — clears the in-memory token cache. */
export function clearUscisTokenCache() {
  cache = null;
  inflight = null;
}
