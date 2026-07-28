import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ReceiptInput } from "@/components/receipt-input";
import { Link } from "@/i18n/navigation";
import { forms, getFormByTrackerSlug, formToPathSlug } from "@/lib/forms";
import { getProcessingTimeContext } from "@/lib/processing-times";
import { listExplanations } from "@/lib/explanations";
import type { Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return forms.map((form) => ({ trackerSlug: form.trackerSlug }));
}

export async function generateMetadata(
  props: PageProps<"/[locale]/forms/[trackerSlug]">,
): Promise<Metadata> {
  const { locale, trackerSlug } = await props.params;
  const form = getFormByTrackerSlug(trackerSlug);
  if (!form) return {};
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("formTrackerTitle", { form: form.code }),
    description: form.shortDescription[locale as Locale],
  };
}

export default async function FormTrackerPage({
  params,
}: PageProps<"/[locale]/forms/[trackerSlug]">) {
  const { locale, trackerSlug } = await params;
  setRequestLocale(locale);

  const form = getFormByTrackerSlug(trackerSlug);
  if (!form) notFound();

  const activeLocale = locale as Locale;
  const t = await getTranslations("seo");
  const tCase = await getTranslations("case");

  const processing = getProcessingTimeContext({
    formType: form.code,
    prefix: "IOE",
    submittedDate: null,
    estimatedFilingDate: null,
  });

  const topStatuses = listExplanations().slice(0, 8);

  return (
    <div className="shell content-page">
      <span className="eyebrow">{form.code}</span>
      <h1>{t("formTrackerHeading", { form: form.code })}</h1>
      <p className="lede">{form.shortDescription[activeLocale]}</p>

      <div className="content-stack">
        <section className="card">
          <div className="card-b receipt-box">
            <h2>{t("checkYours")}</h2>
            <ReceiptInput size="lg" />
          </div>
        </section>

        {processing ? (
          <section className="card">
            <div className="card-b">
              <h2>{tCase("processingTitle")}</h2>
              <p className="grey">
                {tCase("processingRange", {
                  form: form.code,
                  low: processing.lowMonths,
                  high: processing.highMonths,
                })}
              </p>
              <p className="content-note">{tCase("processingDisclaimer")}</p>
              <div className="content-actions">
                <Link
                  href={`/processing-times/${formToPathSlug(form.code)}`}
                  className="button is-secondary is-small"
                >
                  {t("moreProcessingTimes")}
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <section>
          <h2>{t("commonStatuses")}</h2>
          <ul className="content-list">
            {topStatuses.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/status/${formToPathSlug(form.code)}/${item.slug}`}
                >
                  <span className="title">{item.match[0] ?? item.slug}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
