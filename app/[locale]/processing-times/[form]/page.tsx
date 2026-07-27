import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ReceiptInput } from "@/components/receipt-input";
import { Link } from "@/i18n/navigation";
import { formFromPathSlug, formToPathSlug, forms } from "@/lib/forms";
import { getProcessingTimeContext } from "@/lib/processing-times";
import type { Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return forms.map((form) => ({ form: formToPathSlug(form.code) }));
}

export async function generateMetadata(
  props: PageProps<"/[locale]/processing-times/[form]">,
): Promise<Metadata> {
  const { locale, form: formSlug } = await props.params;
  const form = formFromPathSlug(formSlug);
  if (!form) return {};
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("processingFormTitle", { form: form.code }),
    description: form.shortDescription[locale as Locale],
  };
}

export default async function ProcessingTimeFormPage({
  params,
}: PageProps<"/[locale]/processing-times/[form]">) {
  const { locale, form: formSlug } = await params;
  setRequestLocale(locale);

  const form = formFromPathSlug(formSlug);
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

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-6 md:py-14">
      <div>
        <h1 className="text-3xl font-semibold text-ink">
          {t("processingFormHeading", { form: form.code })}
        </h1>
        <p className="mt-2 text-ink-muted">
          {form.shortDescription[activeLocale]}
        </p>
      </div>

      {processing ? (
        <section className="rounded-lg border-[0.5px] border-line bg-surface p-5 md:p-6">
          <p className="text-ink">
            {tCase("processingRange", {
              form: form.code,
              low: processing.lowMonths,
              high: processing.highMonths,
            })}
          </p>
          <p className="mt-3 text-sm text-ink-muted">
            {tCase("processingDisclaimer")}
          </p>
        </section>
      ) : (
        <p className="text-sm text-ink-muted">{t("processingUnavailable")}</p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">{t("checkYours")}</h2>
        <ReceiptInput />
      </section>

      <Link
        href={`/forms/${form.trackerSlug}`}
        className="text-sm font-medium text-brand-700 underline"
      >
        {t("formTracker", { form: form.code })}
      </Link>
    </div>
  );
}
