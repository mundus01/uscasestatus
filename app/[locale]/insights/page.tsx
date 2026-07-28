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
    <div className="shell content-page">
      <h1>{t("title")}</h1>
      <p className="lede">{t("body")}</p>

      <div className="content-stack">
        <div className="content-grid">
          <div className="content-stat">
            <p className="label">{t("corpusLabel")}</p>
            <p className="value">{caseCount.toLocaleString(locale)}</p>
          </div>
          <div className="content-stat">
            <p className="label">{t("eventsLabel")}</p>
            <p className="value">{eventCount.toLocaleString(locale)}</p>
          </div>
        </div>

        <section>
          <h2>{t("feedTitle")}</h2>
          {recent.length === 0 ? (
            <p className="grey">{t("feedEmpty")}</p>
          ) : (
            <ul className="content-list">
              {recent.map((row) => (
                <li key={`${row.receipt}-${row.observed_at}`}>
                  <Link href={`/case/${row.receipt}`}>
                    <span className="title">{row.receipt.slice(0, 8)}…</span>
                    <span className="sub">{row.to_status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
