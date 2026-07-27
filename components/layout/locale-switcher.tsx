"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  const activeLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(locale: Locale) {
    if (locale === activeLocale) return;
    // `pathname` is locale-agnostic, so the same page is kept across languages.
    router.replace(pathname, { locale });
  }

  return (
    <div
      className="flex items-center rounded-md border-hairline border-line bg-surface p-0.5"
      role="group"
      aria-label={t("label")}
    >
      {locales.map((locale) => {
        const isActive = locale === activeLocale;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            onClick={() => switchTo(locale)}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "rounded-sm px-2.5 py-1 text-sm font-medium",
              isActive
                ? "bg-brand-50 text-brand-700"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {t(locale)}
          </button>
        );
      })}
    </div>
  );
}
