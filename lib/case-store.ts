import "server-only";

import {
  findExplanation,
  getExplanationCopy,
  statusSlugFromText,
} from "@/lib/explanations";
import { sendStatusChangeEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CheckCaseSuccess } from "@/lib/check-case";
import type { Locale } from "@/i18n/routing";
import { isLocale } from "@/i18n/routing";

/**
 * Upsert the canonical case row and append a case_event when status changes.
 */
export async function upsertCaseFromCheck(
  data: CheckCaseSuccess,
): Promise<{ changed: boolean; previousStatus: string | null }> {
  const supabase = createAdminClient();
  const statusEn = data.statusTextEn;
  const explanation = findExplanation(statusEn);
  const statusSlug =
    explanation.slug === "unknown"
      ? statusSlugFromText(statusEn)
      : explanation.slug;

  const { data: existing } = await supabase
    .from("cases")
    .select("last_status")
    .eq("receipt", data.receipt)
    .maybeSingle();

  const previousStatus = existing?.last_status ?? null;
  const changed = previousStatus != null && previousStatus !== statusEn;

  const { error } = await supabase.from("cases").upsert(
    {
      receipt: data.receipt,
      prefix: data.prefix,
      form_type: data.formType,
      last_status: statusEn,
      last_status_slug: statusSlug,
      last_description: data.statusDescriptionEn,
      submitted_date: data.submittedDate,
      modified_date: data.modifiedDate,
      history: data.history,
      last_checked: data.checkedAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "receipt" },
  );

  if (error) {
    console.warn("[case-store] upsert failed:", error.message);
    return { changed: false, previousStatus };
  }

  if (previousStatus == null || changed) {
    const { error: eventError } = await supabase.from("case_events").insert({
      receipt: data.receipt,
      from_status: previousStatus,
      to_status: statusEn,
      observed_at: data.checkedAt,
    });
    if (eventError) {
      console.warn("[case-store] event insert failed:", eventError.message);
    }
  }

  if (changed) {
    void alertTrackersOnChange({
      receipt: data.receipt,
      fromStatus: previousStatus,
      toStatus: statusEn,
    });
  }

  return { changed, previousStatus };
}

/** Notify confirmed trackers when a case status changed. */
export async function alertTrackersOnChange(input: {
  receipt: string;
  fromStatus: string | null;
  toStatus: string;
}): Promise<number> {
  const supabase = createAdminClient();
  const { data: trackers, error } = await supabase
    .from("tracked_cases")
    .select("id, email, locale, unsubscribe_token, last_alerted_status, channels")
    .eq("receipt", input.receipt)
    .eq("confirmed", true);

  if (error || !trackers?.length) return 0;

  const explanation = findExplanation(input.toStatus);
  let sent = 0;

  for (const tracker of trackers) {
    const channels = tracker.channels as { email?: boolean } | null;
    if (channels && channels.email === false) continue;
    if (tracker.last_alerted_status === input.toStatus) continue;

    const locale: Locale = isLocale(tracker.locale) ? tracker.locale : "en";
    const copy = getExplanationCopy(explanation, locale);

    const result = await sendStatusChangeEmail({
      to: tracker.email,
      receipt: input.receipt,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      plainEnglish: copy.plainEnglish,
      whatToDo: copy.whatToDo,
      unsubscribeToken: tracker.unsubscribe_token,
      locale,
    });

    if (result.ok) {
      sent += 1;
      await supabase
        .from("tracked_cases")
        .update({
          last_alerted_status: input.toStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tracker.id);
    }
  }

  return sent;
}
