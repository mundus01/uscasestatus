import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ReceiptInput } from "@/components/receipt-input";
import { Link } from "@/i18n/navigation";
import {
  getExplanationBySlug,
  getExplanationCopy,
  listExplanations,
} from "@/lib/explanations";
import { formFromPathSlug, formToPathSlug, forms } from "@/lib/forms";
import type { Locale } from "@/i18n/routing";

export function generateStaticParams() {
  const explanations = listExplanations();
  return forms.flatMap((form) =>
    explanations.map((item) => ({
      form: formToPathSlug(form.code),
      slug: item.slug,
    })),
  );
}

export async function generateMetadata(
  props: PageProps<"/[locale]/status/[form]/[slug]">,
): Promise<Metadata> {
  const { locale, form: formSlug, slug } = await props.params;
  const form = formFromPathSlug(formSlug);
  const explanation = getExplanationBySlug(slug);
  if (!form || !explanation) return {};

  const t = await getTranslations({ locale, namespace: "seo" });
  const title = explanation.match[0] ?? explanation.slug;
  return {
    title: t("statusPageTitle", { status: title, form: form.code }),
    description: explanation.plainEnglish[locale as Locale].slice(0, 160),
  };
}

export default async function StatusExplainerPage({
  params,
}: PageProps<"/[locale]/status/[form]/[slug]">) {
  const { locale, form: formSlug, slug } = await params;
  setRequestLocale(locale);

  const form = formFromPathSlug(formSlug);
  const explanation = getExplanationBySlug(slug);
  if (!form || !explanation) notFound();

  const activeLocale = locale as Locale;
  const t = await getTranslations("seo");
  const copy = getExplanationCopy(explanation, activeLocale);
  const official = explanation.match[0] ?? explanation.slug;

  return (
    <div className="shell content-page">
      <span className="eyebrow">{form.code}</span>
      <h1>{official}</h1>
      <p className="lede">{form.commonName[activeLocale]}</p>

      <div className="content-stack">
        <section className="card">
          <div className="card-b">
            <h2>{t("whatItMeans")}</h2>
            <p className="grey">{copy.plainEnglish}</p>
            <h2>{t("whatToDo")}</h2>
            <p className="grey">{copy.whatToDo}</p>
          </div>
        </section>

        <section className="card">
          <div className="card-b receipt-box">
            <h2>{t("checkYours")}</h2>
            <ReceiptInput />
          </div>
        </section>

        <p className="content-links">
          <Link href="/status">{t("allStatuses")}</Link>
          {" · "}
          <Link href={`/forms/${form.trackerSlug}`}>
            {t("formTracker", { form: form.code })}
          </Link>
        </p>
      </div>
    </div>
  );
}
