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
    <div className="shell content-page">
      <h1>{t("statusHubTitle")}</h1>
      <p className="lede">{t("statusHubBody")}</p>

      <ul className="content-list">
        {explanations.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/status/${formToPathSlug(primaryForm.code)}/${item.slug}`}
            >
              <span className="title">
                {item.plainEnglish[activeLocale].slice(0, 120)}
                {item.plainEnglish[activeLocale].length > 120 ? "…" : ""}
              </span>
              <span className="sub">{item.match[0] ?? item.slug}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
