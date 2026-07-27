import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type LookupRecord = {
  receiptBlock: string;
  prefix: string;
  formType: string | null;
  statusSlug: string;
  statusText: string;
};

/**
 * Fire-and-forget anonymized lookup log. Never throws to the caller — corpus
 * collection must not break a user's status check.
 */
export async function logLookup(record: LookupRecord): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("lookups").insert({
      receipt_block: record.receiptBlock,
      prefix: record.prefix,
      form_type: record.formType,
      status_slug: record.statusSlug,
      status_text: record.statusText,
    });

    if (error) {
      console.warn("[lookups] insert failed:", error.message);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.warn("[lookups] skipped:", message);
  }
}
