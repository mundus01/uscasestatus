import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SignInForm } from "@/components/auth/sign-in-form";
import { safeNextPath } from "@/lib/claim-fields";

export async function generateMetadata(
  props: PageProps<"/[locale]/sign-in">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("signInTitle"), robots: { index: false, follow: false } };
}

export default async function SignInPage({
  params,
  searchParams,
}: PageProps<"/[locale]/sign-in">) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  const rawNext = typeof query.next === "string" ? query.next : null;
  const defaultNext = locale === "en" ? "/dashboard" : `/${locale}/dashboard`;
  const next = safeNextPath(rawNext, defaultNext);
  const initialError = query.error === "auth";

  return (
    <div className="shell content-page content-narrow">
      <h1>{t("signInTitle")}</h1>
      <p className="lede">{t("signInBody")}</p>
      <SignInForm locale={locale} next={next} initialError={initialError} />
    </div>
  );
}
