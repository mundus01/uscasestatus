"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { safeNextPath } from "@/lib/claim-fields";
import { createClient } from "@/lib/supabase/client";

/**
 * Handles legacy/implicit Supabase redirects that put tokens in the URL hash
 * (`#access_token=...`). Hash fragments never reach the server route handler.
 */
export function AuthHashHandler() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    if (typeof window === "undefined") return;

    const rawHash = window.location.hash;
    if (!rawHash || rawHash.length < 2) return;

    const params = new URLSearchParams(rawHash.startsWith("#") ? rawHash.slice(1) : rawHash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) return;

    ran.current = true;

    const search = new URLSearchParams(window.location.search);
    const next = safeNextPath(search.get("next"), "/dashboard");

    void (async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        // Always strip tokens from the address bar.
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`,
        );

        if (error) {
          router.replace(`/sign-in?error=auth`);
          return;
        }

        router.replace(next);
        router.refresh();
      } catch {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`,
        );
        router.replace(`/sign-in?error=auth`);
      }
    })();
  }, [router]);

  return null;
}
