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
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 md:px-6 md:py-14">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      {tracked.length === 0 ? (
        <div className="rounded-lg border-[0.5px] border-line bg-surface p-6">
          <p className="text-sm text-ink-muted">{t("empty")}</p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-brand-700 underline"
          >
            {t("checkCase")}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {tracked.map((row) => (
            <li key={row.id}>
              <Link
                href={`/case/${row.receipt}`}
                className="block rounded-lg border-[0.5px] border-line bg-surface p-4 transition-colors hover:border-brand-500"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-mono text-sm font-medium text-ink">
                    {formatReceipt(row.receipt)}
                  </p>
                  {row.caseRow?.form_type ? (
                    <p className="text-xs text-ink-muted">
                      {row.caseRow.form_type}
                    </p>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-ink">
                  {row.caseRow?.last_status ?? t("statusUnknown")}
                </p>
                {row.nickname ? (
                  <p className="mt-1 text-xs text-ink-muted">{row.nickname}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
