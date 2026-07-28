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
    <div className="shell content-page">
      <span className="eyebrow">{form.code}</span>
      <h1>{t("processingFormHeading", { form: form.code })}</h1>
      <p className="lede">{form.shortDescription[activeLocale]}</p>

      <div className="content-stack">
        {processing ? (
          <section className="card">
            <div className="card-b">
              <p className="grey">
                {tCase("processingRange", {
                  form: form.code,
                  low: processing.lowMonths,
                  high: processing.highMonths,
                })}
              </p>
              <p className="content-note">{tCase("processingDisclaimer")}</p>
            </div>
          </section>
        ) : (
          <p className="grey">{t("processingUnavailable")}</p>
        )}

        <section className="card">
          <div className="card-b receipt-box">
            <h2>{t("checkYours")}</h2>
            <ReceiptInput />
          </div>
        </section>

        <p className="content-links">
          <Link href={`/forms/${form.trackerSlug}`}>
            {t("formTracker", { form: form.code })}
          </Link>
        </p>
      </div>
    </div>
  );
}
