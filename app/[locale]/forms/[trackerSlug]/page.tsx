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
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-6 md:py-14">
      <div>
        <p className="text-sm font-medium text-brand-700">{form.code}</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">
          {t("formTrackerHeading", { form: form.code })}
        </h1>
        <p className="mt-2 text-ink-muted">
          {form.shortDescription[activeLocale]}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">{t("checkYours")}</h2>
        <ReceiptInput size="lg" />
      </section>

      {processing ? (
        <section className="rounded-lg border-[0.5px] border-line bg-surface p-5">
          <h2 className="text-lg font-semibold text-ink">
            {tCase("processingTitle")}
          </h2>
          <p className="mt-2 text-sm text-ink">
            {tCase("processingRange", {
              form: form.code,
              low: processing.lowMonths,
              high: processing.highMonths,
            })}
          </p>
          <p className="mt-2 text-xs text-ink-muted">
            {tCase("processingDisclaimer")}
          </p>
          <Link
            href={`/processing-times/${formToPathSlug(form.code)}`}
            className="mt-3 inline-block text-sm font-medium text-brand-700 underline"
          >
            {t("moreProcessingTimes")}
          </Link>
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-ink">{t("commonStatuses")}</h2>
        <ul className="mt-3 divide-y divide-line rounded-lg border-[0.5px] border-line bg-surface">
          {topStatuses.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/status/${formToPathSlug(form.code)}/${item.slug}`}
                className="block px-4 py-3 text-sm hover:bg-brand-50"
              >
                <span className="font-medium text-ink">
                  {item.match[0] ?? item.slug}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
