import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="mt-auto border-t-hairline border-line bg-surface">
      <div className="mx-auto max-w-5xl space-y-3 px-4 py-8 md:px-6">
        <p className="text-sm leading-relaxed text-ink-muted">
          {t("notAffiliated")}
        </p>
        <p className="text-sm leading-relaxed text-ink-muted">
          {t("notLegalAdvice")}
        </p>
        <p className="text-sm text-ink-subtle">
          {t("rights", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
