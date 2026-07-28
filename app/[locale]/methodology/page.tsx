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
    <div className="shell content-page">
      <h1>{t("title")}</h1>
      <p className="lede">{t("body")}</p>
    </div>
  );
}
