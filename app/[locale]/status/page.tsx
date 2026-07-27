import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { listExplanations } from "@/lib/explanations";
import { forms, formToPathSlug } from "@/lib/forms";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata(
  props: PageProps<"/[locale]/status">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("statusHubTitle"),
    description: t("statusHubDescription"),
  };
}

export default async function StatusHubPage({
  params,
}: PageProps<"/[locale]/status">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("seo");
  const activeLocale = locale as Locale;
  const explanations = listExplanations();
  const primaryForm = forms.find((form) => form.code === "I-485") ?? forms[0];

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-6 md:py-14">
      <div>
        <h1 className="text-3xl font-semibold text-ink">{t("statusHubTitle")}</h1>
        <p className="mt-2 text-ink-muted">{t("statusHubBody")}</p>
      </div>

      <ul className="divide-y divide-line rounded-lg border-[0.5px] border-line bg-surface">
        {explanations.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/status/${formToPathSlug(primaryForm.code)}/${item.slug}`}
              className="block px-4 py-3 hover:bg-brand-50"
            >
              <p className="font-medium text-ink">
                {item.plainEnglish[activeLocale].slice(0, 120)}
                {item.plainEnglish[activeLocale].length > 120 ? "…" : ""}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {item.match[0] ?? item.slug}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
