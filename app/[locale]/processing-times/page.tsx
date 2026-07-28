import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { forms, formToPathSlug } from "@/lib/forms";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata(
  props: PageProps<"/[locale]/processing-times">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("processingHubTitle"),
    description: t("processingHubDescription"),
  };
}

export default async function ProcessingTimesHubPage({
  params,
}: PageProps<"/[locale]/processing-times">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("seo");
  const activeLocale = locale as Locale;

  return (
    <div className="shell content-page">
      <h1>{t("processingHubTitle")}</h1>
      <p className="lede">{t("processingHubBody")}</p>

      <div className="content-grid">
        {forms.map((form) => (
          <Link
            key={form.code}
            href={`/processing-times/${formToPathSlug(form.code)}`}
            className="formcard"
          >
            <span className="code">{form.code}</span>
            <span className="nm">
              <b>{form.commonName[activeLocale]}</b>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
