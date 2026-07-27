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
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-6 md:py-14">
      <div>
        <h1 className="text-3xl font-semibold text-ink">
          {t("processingHubTitle")}
        </h1>
        <p className="mt-2 text-ink-muted">{t("processingHubBody")}</p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {forms.map((form) => (
          <li key={form.code}>
            <Link
              href={`/processing-times/${formToPathSlug(form.code)}`}
              className="block rounded-lg border-[0.5px] border-line bg-surface p-4 hover:border-brand-500"
            >
              <p className="font-semibold text-ink">{form.code}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {form.commonName[activeLocale]}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
