"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

type LocaleSwitcherProps = {
  variant?: "header" | "footer";
};

export function LocaleSwitcher({ variant = "header" }: LocaleSwitcherProps) {
  const t = useTranslations("localeSwitcher");
  const activeLocale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(locale: Locale) {
    if (locale === activeLocale) return;
    router.replace(pathname, { locale });
  }

  if (variant === "footer") {
    return (
      <div className="footer-lang" role="group" aria-label={t("label")}>
        {locales.map((locale) => {
          const label = locale === "en" ? "English" : "Español";
          if (locale === activeLocale) {
            return <b key={locale}>{label}</b>;
          }
          return (
            <button
              key={locale}
              type="button"
              lang={locale}
              onClick={() => switchTo(locale)}
            >
              <i>{label}</i>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="lang" role="group" aria-label={t("label")}>
      {locales.map((locale) => {
        const isActive = locale === activeLocale;
        const label = locale.toUpperCase();
        if (isActive) {
          return <b key={locale}>{label}</b>;
        }
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            onClick={() => switchTo(locale)}
          >
            <i>{label}</i>
          </button>
        );
      })}
    </div>
  );
}
