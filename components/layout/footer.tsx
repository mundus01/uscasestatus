import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

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
            {t("synced")}
          </small>
          <nav>
            <Link href="/methodology">{t("privacy")}</Link>
            <Link href="/methodology">{t("terms")}</Link>
            <Link href="/methodology">{t("cookies")}</Link>
            <Link href="/methodology">{t("accessibility")}</Link>
            <Link href="/methodology">{t("doNotSell")}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
