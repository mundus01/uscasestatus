import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ReceiptInput } from "@/components/receipt-input";
import { Card, CardBody } from "@/components/ui/card";
import { forms } from "@/lib/forms";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata(
  props: PageProps<"/[locale]">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
    alternates: {
      canonical: locale === "en" ? "/" : `/${locale}`,
      languages: { en: "/", es: "/es" },
    },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const activeLocale = locale as Locale;

  const steps = [
    { title: t("howItWorks.step1Title"), body: t("howItWorks.step1Body") },
    { title: t("howItWorks.step2Title"), body: t("howItWorks.step2Body") },
    { title: t("howItWorks.step3Title"), body: t("howItWorks.step3Body") },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6">
      <section className="py-12 md:py-20">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-ink md:text-4xl">
          {t("heading")}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">
          {t("subheading")}
        </p>

        <Card className="mt-8 max-w-2xl">
          <CardBody>
            <ReceiptInput size="lg" />
          </CardBody>
        </Card>

        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
          <li>{t("trust.free")}</li>
          <li>{t("trust.noAccount")}</li>
          <li>{t("trust.noAds")}</li>
        </ul>
      </section>

      <section className="border-t-hairline border-line py-12 md:py-16">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          {t("howItWorks.heading")}
        </h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                {index + 1}
              </span>
              <h3 className="mt-3 font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t-hairline border-line py-12 md:py-16">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          {t("forms.heading")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {t("forms.body")}
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <li key={form.code}>
              <Card className="h-full">
                <CardBody className="p-4 md:p-4">
                  <p className="tabular text-sm font-semibold text-brand-700">
                    {form.code}
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {form.commonName[activeLocale]}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {form.shortDescription[activeLocale]}
                  </p>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
