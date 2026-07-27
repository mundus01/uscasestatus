import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Wordmark } from "@/components/layout/wordmark";
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
    <header className="border-b-hairline border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" aria-label={t("home")} className="flex items-center">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/insights"
            className="hidden text-sm font-medium text-ink-muted hover:text-ink sm:inline"
          >
            {t("insights")}
          </Link>
          {signedIn ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-brand-700 hover:text-brand-500"
            >
              {t("dashboard")}
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="text-sm font-medium text-ink-muted hover:text-ink"
            >
              {t("signIn")}
            </Link>
          )}
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
