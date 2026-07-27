import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <div className="mx-auto max-w-5xl px-4 py-20 md:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
        {t("notFoundTitle")}
      </h1>
      <p className="mt-3 max-w-xl leading-relaxed text-ink-muted">
        {t("notFoundBody")}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-md bg-brand-500 px-5 font-medium text-white hover:bg-brand-700"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
