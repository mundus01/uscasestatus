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
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-6 md:py-14">
      <div>
        <p className="text-sm font-medium text-brand-700">{form.code}</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">{official}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {form.commonName[activeLocale]}
        </p>
      </div>

      <section className="space-y-3 rounded-lg border-[0.5px] border-line bg-surface p-5 md:p-6">
        <h2 className="text-lg font-semibold text-ink">{t("whatItMeans")}</h2>
        <p className="text-ink">{copy.plainEnglish}</p>
        <h2 className="pt-2 text-lg font-semibold text-ink">{t("whatToDo")}</h2>
        <p className="text-ink">{copy.whatToDo}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">{t("checkYours")}</h2>
        <ReceiptInput />
      </section>

      <p className="text-sm text-ink-muted">
        <Link href="/status" className="text-brand-700 underline">
          {t("allStatuses")}
        </Link>
        {" · "}
        <Link
          href={`/forms/${form.trackerSlug}`}
          className="text-brand-700 underline"
        >
          {t("formTracker", { form: form.code })}
        </Link>
      </p>
    </div>
  );
}
