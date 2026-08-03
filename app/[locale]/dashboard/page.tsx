import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { listClaimsForUser } from "@/lib/claims";
import { createClient } from "@/lib/supabase/server";
import { listTrackedForUser } from "@/lib/tracking";
import { formatReceipt } from "@/lib/receipt";
import { createAdminClient } from "@/lib/supabase/admin";

export async function generateMetadata(
  props: PageProps<"/[locale]/dashboard">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

type DashboardRow = {
  receipt: string;
  formType: string | null;
  lastStatus: string | null;
  nickname: string | null;
  tracked: boolean;
  claimed: boolean;
};

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

  const [tracked, claims] = await Promise.all([
    listTrackedForUser(user.id, user.email),
    listClaimsForUser(user.id),
  ]);

  const byReceipt = new Map<string, DashboardRow>();

  for (const row of tracked) {
    byReceipt.set(row.receipt, {
      receipt: row.receipt,
      formType: row.caseRow?.form_type ?? null,
      lastStatus: row.caseRow?.last_status ?? null,
      nickname: row.nickname,
      tracked: true,
      claimed: false,
    });
  }

  for (const claim of claims) {
    const existing = byReceipt.get(claim.receipt);
    if (existing) {
      existing.claimed = true;
    } else {
      byReceipt.set(claim.receipt, {
        receipt: claim.receipt,
        formType: null,
        lastStatus: null,
        nickname: null,
        tracked: false,
        claimed: true,
      });
    }
  }

  // Fill status for claim-only receipts from cases table.
  const claimOnly = [...byReceipt.values()].filter(
    (row) => row.claimed && !row.lastStatus,
  );
  if (claimOnly.length > 0) {
    try {
      const admin = createAdminClient();
      const { data: caseRows } = await admin
        .from("cases")
        .select("receipt, last_status, form_type")
        .in(
          "receipt",
          claimOnly.map((row) => row.receipt),
        );
      for (const caseRow of caseRows ?? []) {
        const row = byReceipt.get(caseRow.receipt);
        if (!row) continue;
        row.lastStatus = caseRow.last_status;
        row.formType = caseRow.form_type;
      }
    } catch {
      // Status enrichment is optional.
    }
  }

  const rows = [...byReceipt.values()].sort((a, b) =>
    a.receipt.localeCompare(b.receipt),
  );

  return (
    <div className="shell content-page">
      <h1>{t("title")}</h1>
      <p className="lede">{t("subtitle")}</p>

      {rows.length === 0 ? (
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
          {rows.map((row) => {
            const badges = [
              row.tracked ? t("badgeTracked") : null,
              row.claimed ? t("badgeDetails") : null,
            ].filter(Boolean);

            return (
              <li key={row.receipt}>
                <Link href={`/case/${row.receipt}`}>
                  <span className="title">{formatReceipt(row.receipt)}</span>
                  <span className="sub">
                    {[
                      row.formType,
                      row.lastStatus ?? t("statusUnknown"),
                      row.nickname,
                      badges.join(" · "),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
