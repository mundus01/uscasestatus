import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export async function generateMetadata(
  props: PageProps<"/[locale]/insights">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "insights" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function InsightsPage({
  params,
}: PageProps<"/[locale]/insights">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("insights");

  let caseCount = 0;
  let eventCount = 0;
  let recent: { receipt: string; to_status: string; observed_at: string }[] =
    [];

  try {
    const supabase = createAdminClient();
    const cases = await supabase
      .from("cases")
      .select("id", { count: "exact", head: true });
    const events = await supabase
      .from("case_events")
      .select("id", { count: "exact", head: true });
    const feed = await supabase
      .from("case_events")
      .select("receipt, to_status, observed_at")
      .order("observed_at", { ascending: false })
      .limit(12);

    caseCount = cases.count ?? 0;
    eventCount = events.count ?? 0;
    recent = feed.data ?? [];
  } catch {
    // Insights stay available when Supabase isn't configured locally.
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-6 md:py-14">
      <div>
        <h1 className="text-3xl font-semibold text-ink">{t("title")}</h1>
        <p className="mt-2 text-ink-muted">{t("body")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border-[0.5px] border-line bg-surface p-5">
          <p className="text-sm text-ink-muted">{t("corpusLabel")}</p>
          <p className="mt-1 text-3xl font-semibold tabular text-ink">
            {caseCount.toLocaleString(locale)}
          </p>
        </div>
        <div className="rounded-lg border-[0.5px] border-line bg-surface p-5">
          <p className="text-sm text-ink-muted">{t("eventsLabel")}</p>
          <p className="mt-1 text-3xl font-semibold tabular text-ink">
            {eventCount.toLocaleString(locale)}
          </p>
        </div>
      </div>

      <section className="rounded-lg border-[0.5px] border-line bg-surface p-5">
        <h2 className="text-lg font-semibold text-ink">{t("feedTitle")}</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">{t("feedEmpty")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {recent.map((row) => (
              <li
                key={`${row.receipt}-${row.observed_at}`}
                className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm"
              >
                <Link
                  href={`/case/${row.receipt}`}
                  className="font-mono text-brand-700"
                >
                  {row.receipt.slice(0, 8)}…
                </Link>
                <span className="text-ink">{row.to_status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
