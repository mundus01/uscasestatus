import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { listTrackedForUser } from "@/lib/tracking";
import { formatReceipt } from "@/lib/receipt";

export async function generateMetadata(
  props: PageProps<"/[locale]/dashboard">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function DashboardPage({
  params,
}: PageProps<"/[locale]/dashboard">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

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
    redirect(locale === "en" ? "/sign-in" : `/${locale}/sign-in`);
  }

  const tracked = await listTrackedForUser(user.id, user.email);

  return (
    <div className="shell content-page">
      <h1>{t("title")}</h1>
      <p className="lede">{t("subtitle")}</p>

      {tracked.length === 0 ? (
        <section className="card">
          <div className="card-b">
            <p className="grey">{t("empty")}</p>
            <div className="content-actions">
              <Link href="/" className="button is-small">
                {t("checkCase")}
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <ul className="content-list">
          {tracked.map((row) => (
            <li key={row.id}>
              <Link href={`/case/${row.receipt}`}>
                <span className="title">{formatReceipt(row.receipt)}</span>
                <span className="sub">
                  {[
                    row.caseRow?.form_type,
                    row.caseRow?.last_status ?? t("statusUnknown"),
                    row.nickname,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
