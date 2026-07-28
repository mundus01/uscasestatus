"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname } from "@/i18n/navigation";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";

type LocaleSwitcherProps = {
  variant?: "header" | "footer";
};

/** Build a public URL for a locale. Avoids `/en` → `/` redirects that break soft nav. */
function hrefForLocale(locale: Locale, pathname: string): string {
  const path = pathname || "/";
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/**
 * Locale switching uses plain anchors (not useRouter.replace).
 * With `localePrefix: "as-needed"`, next-intl's router.replace can update the
 * cookie without navigating, and Link's forced `/en` prefix redirects flakily
 * on mobile soft navigation.
 */
export function LocaleSwitcher({ variant = "header" }: LocaleSwitcherProps) {
  const t = useTranslations("localeSwitcher");
  const activeLocale = useLocale() as Locale;
  const pathname = usePathname();

  return (
    <div
      className={variant === "footer" ? "footer-lang" : "lang"}
      role="group"
      aria-label={t("label")}
    >
      {locales.map((locale) => {
        const label =
          variant === "footer"
            ? locale === "en"
              ? "English"
              : "Español"
            : locale.toUpperCase();

        if (locale === activeLocale) {
          return (
            <b key={locale} aria-current="true">
              {label}
            </b>
          );
        }

        return (
          <a
            key={locale}
            href={hrefForLocale(locale, pathname)}
            lang={locale}
            hrefLang={locale}
          >
            {variant === "footer" ? <i>{label}</i> : label}
          </a>
        );
      })}
    </div>
  );
}
