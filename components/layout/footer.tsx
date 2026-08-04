import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Link } from "@/i18n/navigation";
import { getLastCorpusSyncAt } from "@/lib/freshness";
import { syncAgeFromTimestamp } from "@/lib/sync-age";

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();
  const lastSyncAt = await getLastCorpusSyncAt();
  const age = syncAgeFromTimestamp(lastSyncAt);

  let syncedLabel: string;
  switch (age.kind) {
    case "never":
      syncedLabel = t("syncedNever");
      break;
    case "just_now":
      syncedLabel = t("syncedJustNow");
      break;
    case "minutes":
      syncedLabel = t("syncedMinutes", { minutes: age.minutes });
      break;
    case "hours":
      syncedLabel = t("syncedHours", { hours: age.hours });
      break;
    case "days":
      syncedLabel = t("syncedDays", { days: age.days });
      break;
  }

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-top">
          <div className="footer-brand">
            <Link className="brand" href="/">
              <span className="mark">CS</span>
              <span className="name">uscasestatus</span>
            </Link>
            <p>{t("blurb")}</p>
            <LocaleSwitcher variant="footer" />
          </div>

          <div className="fcol">
            <h4>{t("checkHeading")}</h4>
            <ul>
              <li>
                <Link href="/">{t("lookup")}</Link>
              </li>
              <li>
                <Link href="/dashboard">{t("trackCases")}</Link>
              </li>
              <li>
                <Link href="/settings">{t("settings")}</Link>
              </li>
              <li>
                <Link href="/">{t("emailAlerts")}</Link>
              </li>
              <li>
                <Link href="/methodology">{t("decoder")}</Link>
              </li>
            </ul>
          </div>

          <div className="fcol">
            <h4>{t("understandHeading")}</h4>
            <ul>
              <li>
                <Link href="/status">{t("statusMeans")}</Link>
              </li>
              <li>
                <Link href="/methodology">{t("estimateHow")}</Link>
              </li>
              <li>
                <Link href="/processing-times">{t("processingTimes")}</Link>
              </li>
              <li>
                <Link href="/insights">{t("visaBulletin")}</Link>
              </li>
              <li>
                <Link href="/status">{t("rfe")}</Link>
              </li>
            </ul>
          </div>

          <div className="fcol">
            <h4>{t("formsHeading")}</h4>
            <ul>
              <li>
                <Link href="/forms/i130-tracker">{t("formI130")}</Link>
              </li>
              <li>
                <Link href="/forms/i140-tracker">{t("formI140")}</Link>
              </li>
              <li>
                <Link href="/forms/i485-tracker">{t("formI485")}</Link>
              </li>
              <li>
                <Link href="/forms/i765-tracker">{t("formI765")}</Link>
              </li>
              <li>
                <Link href="/forms/n400-tracker">{t("formN400")}</Link>
              </li>
            </ul>
          </div>

          <div className="fcol">
            <h4>{t("companyHeading")}</h4>
            <ul>
              <li>
                <Link href="/methodology">{t("about")}</Link>
              </li>
              <li>
                <Link href="/methodology">{t("methodology")}</Link>
              </li>
              <li>
                <Link href="/insights">{t("insights")}</Link>
              </li>
              <li>
                <Link href="/">{t("contact")}</Link>
              </li>
              <li>
                <Link href="/">{t("report")}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-disclaimer">
          <span className="flag" aria-hidden="true">
            !
          </span>
          <div className="cols">
            <p>
              <b>{t("disclaimerLead")}</b> {t("disclaimerGov")}
            </p>
            <p>{t("disclaimerLegal")}</p>
          </div>
        </div>

        <div className="footer-bottom">
          <small>{t("copyright", { year })}</small>
          <small className="sync">
            <span className="led" />
            {syncedLabel}
          </small>
          <nav>
            <a href="/privacy">{t("privacy")}</a>
            <a href="/terms">{t("terms")}</a>
            <a href="/cookies">{t("cookies")}</a>
            <a href="/accessibility">{t("accessibility")}</a>
            <a href="/do-not-sell">{t("doNotSell")}</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
