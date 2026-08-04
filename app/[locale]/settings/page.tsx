import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { ClearClaimsPanel } from "@/components/settings/clear-claims-panel";
import { DeleteAccountPanel } from "@/components/settings/delete-account-panel";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(
  props: PageProps<"/[locale]/settings">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "settings" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function SettingsPage({
  params,
}: PageProps<"/[locale]/settings">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  let user: { id: string; email?: string } | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user
      ? { id: data.user.id, email: data.user.email ?? undefined }
      : null;
  } catch {
    user = null;
  }

  if (!user?.email) {
    const signIn =
      locale === "en"
        ? "/sign-in?next=/settings"
        : `/${locale}/sign-in?next=/${locale}/settings`;
    redirect(signIn);
  }

  return (
    <div className="shell content-page content-narrow-lg">
      <span className="eyebrow">{t("eyebrow")}</span>
      <h1>{t("title")}</h1>
      <p className="lede">{t("subtitle")}</p>

      <section className="card" aria-labelledby="settings-account-title">
        <div className="card-b">
          <h2 id="settings-account-title">{t("accountTitle")}</h2>
          <p className="grey">
            {t("signedInAs")}{" "}
            <strong className="settings-email">{user.email}</strong>
          </p>
          <div className="content-actions">
            <Link href="/dashboard" className="button is-secondary is-small">
              {t("backToCases")}
            </Link>
          </div>
        </div>
      </section>

      <section className="content-stack" aria-labelledby="settings-privacy-title">
        <h2 id="settings-privacy-title">{t("privacyTitle")}</h2>
        <p className="grey">{t("privacyBody")}</p>

        <ClearClaimsPanel
          labels={{
            title: t("clearClaimsTitle"),
            body: t("clearClaimsBody"),
            start: t("clearClaimsStart"),
            confirmTitle: t("clearClaimsConfirmTitle"),
            confirmBody: t("clearClaimsConfirmBody"),
            confirm: t("clearClaimsConfirm"),
            cancel: t("cancel"),
            clearing: t("clearClaimsClearing"),
            success: t("clearClaimsSuccess"),
            error: t("clearClaimsError"),
          }}
        />

        <DeleteAccountPanel
          locale={locale}
          labels={{
            title: t("deleteTitle"),
            body: t("deleteBody"),
            deletesHeading: t("deletesHeading"),
            deletesAccount: t("deletesAccount"),
            deletesClaims: t("deletesClaims"),
            deletesTracked: t("deletesTracked"),
            keepsHeading: t("keepsHeading"),
            keepsCorpus: t("keepsCorpus"),
            keepsUscis: t("keepsUscis"),
            timeline: t("timeline"),
            start: t("deleteStart"),
            confirmTitle: t("deleteConfirmTitle"),
            confirmBody: t("deleteConfirmBody"),
            confirm: t("deleteConfirm"),
            cancel: t("cancel"),
            deleting: t("deleting"),
            error: t("deleteError"),
          }}
        />
      </section>
    </div>
  );
}
