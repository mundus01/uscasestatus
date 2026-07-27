import { defineRouting } from "next-intl/routing";

export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // English serves from `/`, Spanish from `/es/...`.
  localePrefix: "as-needed",
  // Deterministic URLs: no Accept-Language redirects, so every page stays
  // statically cacheable and search engines always land where they linked.
  localeDetection: false,
});

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
