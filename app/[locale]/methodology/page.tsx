import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "methodology" });
  return {
    title: t("title"),
    description: t("body"),
  };
}

export default async function MethodologyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("methodology");

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-10 md:px-6 md:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-ink">{t("title")}</h1>
      <p className="leading-relaxed text-ink-muted">{t("body")}</p>
    </div>
  );
}
