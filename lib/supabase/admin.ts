import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { requireSupabasePublicEnv, requireSupabaseServiceRoleKey } from "@/lib/env";

/**
 * Service-role client. Bypasses RLS, so it must never be imported into
 * anything that reaches the browser. Use it for cron jobs and trusted writes.
 */
export function createAdminClient() {
  const { url } = requireSupabasePublicEnv();

  return createSupabaseClient(url, requireSupabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
