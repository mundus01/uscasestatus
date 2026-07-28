import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SignInForm } from "@/components/auth/sign-in-form";

export async function generateMetadata(
  props: PageProps<"/[locale]/sign-in">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("signInTitle"), robots: { index: false, follow: false } };
}

export default async function SignInPage({
  params,
}: PageProps<"/[locale]/sign-in">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <div className="shell content-page content-narrow">
      <h1>{t("signInTitle")}</h1>
      <p className="lede">{t("signInBody")}</p>
      <SignInForm
        locale={locale}
        emailLabel={t("emailLabel")}
        emailPlaceholder={t("emailPlaceholder")}
        submitLabel={t("sendLink")}
        submittingLabel={t("sending")}
        successMessage={t("linkSent")}
        errorMessage={t("errorGeneric")}
      />
    </div>
  );
}
