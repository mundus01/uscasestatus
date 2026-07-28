import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
  const t = await getTranslations("nav");

  let signedIn = false;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    signedIn = Boolean(data.user);
  } catch {
    signedIn = false;
  }

  return (
    <header className="site-header">
      <div className="shell">
        <Link className="brand" href="/" aria-label={t("home")}>
          <span className="mark">CS</span>
          <span className="name">uscasestatus</span>
        </Link>
        <nav className="mainnav">
          <Link href="/">Check a case</Link>
          <Link href="/processing-times">Processing times</Link>
          <Link href="/forms/i-485">Form guides</Link>
          <Link href="/insights">{t("insights")}</Link>
        </nav>
        <div className="header-r">
          <LocaleSwitcher />
          {signedIn ? (
            <Link className="signin" href="/dashboard">
              {t("dashboard")}
            </Link>
          ) : (
            <Link className="signin" href="/sign-in">
              {t("signIn")}
            </Link>
          )}
          {signedIn ? null : (
            <Link className="button is-small" href="/sign-in">
              Create account
            </Link>
          )}
          <button className="burger" type="button" aria-label="Open menu">
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
