import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { HomeAlertCta } from "@/components/home/home-alert-cta";
import { HomeLookup } from "@/components/home/home-lookup";
import { Link } from "@/i18n/navigation";
import { getForm } from "@/lib/forms";

const HIGHLIGHT_FORM_CODES = [
  "I-130",
  "I-140",
  "I-485",
  "I-765",
  "I-751",
  "N-400",
] as const;

const FORM_MESSAGE_KEYS = {
  "I-130": { name: "i130Name", desc: "i130Desc" },
  "I-140": { name: "i140Name", desc: "i140Desc" },
  "I-485": { name: "i485Name", desc: "i485Desc" },
  "I-765": { name: "i765Name", desc: "i765Desc" },
  "I-751": { name: "i751Name", desc: "i751Desc" },
  "N-400": { name: "n400Name", desc: "n400Desc" },
} as const;

export async function generateMetadata(
  props: PageProps<"/[locale]">,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
    alternates: {
      canonical: locale === "en" ? "/" : `/${locale}`,
      languages: { en: "/", es: "/es" },
    },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tForms = await getTranslations("home.forms");

  const featured = HIGHLIGHT_FORM_CODES.map((code) => {
    const form = getForm(code);
    const keys = FORM_MESSAGE_KEYS[code];
    return {
      code,
      href: form ? `/forms/${form.trackerSlug}` : "/forms/i485-tracker",
      name: tForms(keys.name),
      description: tForms(keys.desc),
    };
  });

  return (
    <>
      <section className="hero">
        <div className="shell">
          <span className="eyebrow">{t("hero.eyebrow")}</span>
          <h1>{t("hero.title")}</h1>
          <p className="lede">{t("hero.lede")}</p>

          <HomeLookup />

          <div className="assur">
            <span>
              <span className="tick">✓</span> {t("hero.noAccount")}
            </span>
            <span>
              <span className="tick">✓</span> {t("hero.free")}
            </span>
            <span>
              <span className="tick">✓</span> {t("hero.bilingual")}
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head center">
            <span className="eyebrow">{t("preview.eyebrow")}</span>
            <h2>{t("preview.title")}</h2>
            <p>{t("preview.body")}</p>
          </div>

          <div className="preview">
            <div className="preview-bar">
              <i />
              <i />
              <i />
              <span>uscasestatus.com/case/IOE0935126486</span>
            </div>
            <div className="preview-body">
              <div className="pv-status">
                <span className="status-pill">
                  <span className="dot" />
                  {t("preview.status")}
                </span>
                <span className="form-chip">I-140</span>
              </div>
              <h3>{t("preview.statusTitle")}</h3>
              <p className="pv-sub">{t("preview.meta")}</p>

              <div className="qtrack">
                <div
                  className="qbar"
                  role="img"
                  aria-label={t("preview.barLabel")}
                >
                  <div className="q1" />
                  <div className="q2" />
                  <div className="q3" />
                  <div className="q4" />
                </div>
                <div className="qyou" aria-hidden="true" />
              </div>
              <div className="qlegend">
                <span>
                  <span className="sw sw-success" />
                  <b>555</b> {t("preview.legendApproved")}
                </span>
                <span>
                  <span className="sw sw-error" />
                  <b>160</b> {t("preview.legendDenied")}
                </span>
                <span>
                  <span className="sw sw-sky" />
                  <b>577</b> {t("preview.legendWaiting")}
                </span>
                <span>
                  <span className="sw sw-neutral" />
                  <b>3,654</b> {t("preview.legendBehind")}
                </span>
              </div>

              <p className="pv-caption">
                {t.rich("preview.caption", {
                  cases: (chunks) => <b>{chunks}</b>,
                  range: (chunks) => <b>{chunks}</b>,
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="shell">
          <div className="section-head">
            <span className="eyebrow">{t("questions.eyebrow")}</span>
            <h2>{t("questions.title")}</h2>
          </div>
          <div className="grid3">
            <div className="fcard">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M4 5h16M4 12h10M4 19h7" />
                </svg>
              </div>
              <h3>{t("questions.meanTitle")}</h3>
              <p>{t("questions.meanBody")}</p>
            </div>
            <div className="fcard">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M3 12h4l3-7 4 14 3-7h4" />
                </svg>
              </div>
              <h3>{t("questions.farTitle")}</h3>
              <p>{t("questions.farBody")}</p>
            </div>
            <div className="fcard">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <h3>{t("questions.whenTitle")}</h3>
              <p>{t("questions.whenBody")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <span className="eyebrow">{t("forms.eyebrow")}</span>
            <h2>{t("forms.title")}</h2>
            <p>{t("forms.body")}</p>
          </div>
          <div className="forms">
            {featured.map((form) => (
              <Link key={form.code} className="formcard" href={form.href}>
                <span className="code">{form.code}</span>
                <span className="nm">
                  <b>{form.name}</b>
                  {form.description}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell">
          <span className="eyebrow">{t("honesty.eyebrow")}</span>
          <h2>{t("honesty.title")}</h2>
          <p className="lede">{t("honesty.lede")}</p>
          <div className="promises">
            <div className="promise">
              <h4>{t("honesty.paywallTitle")}</h4>
              <p>{t("honesty.paywallBody")}</p>
            </div>
            <div className="promise">
              <h4>{t("honesty.mathTitle")}</h4>
              <p>{t("honesty.mathBody")}</p>
            </div>
            <div className="promise">
              <h4>{t("honesty.gapsTitle")}</h4>
              <p>{t("honesty.gapsBody")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="ctaband">
            <div>
              <h2>{t("alerts.title")}</h2>
              <p>{t("alerts.body")}</p>
            </div>
            <HomeAlertCta />
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="shell">
          <div className="section-head">
            <span className="eyebrow">{t("faq.eyebrow")}</span>
            <h2>{t("faq.title")}</h2>
          </div>
          <div className="faq">
            <details open>
              <summary>{t("faq.q1")}</summary>
              <div className="a">{t("faq.a1")}</div>
            </details>
            <details>
              <summary>{t("faq.q2")}</summary>
              <div className="a">{t("faq.a2")}</div>
            </details>
            <details>
              <summary>{t("faq.q3")}</summary>
              <div className="a">{t("faq.a3")}</div>
            </details>
            <details>
              <summary>{t("faq.q4")}</summary>
              <div className="a">{t("faq.a4")}</div>
            </details>
            <details>
              <summary>{t("faq.q5")}</summary>
              <div className="a">{t("faq.a5")}</div>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}
