import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { HomeAlertCta } from "@/components/home/home-alert-cta";
import { HomeLookup } from "@/components/home/home-lookup";
import { Link } from "@/i18n/navigation";
import { getForm } from "@/lib/forms";

/** Mockup copy for the six highlight cards (EN). */
const HIGHLIGHT_FORMS = [
  {
    code: "I-130",
    name: "Family petition",
    description: "Petition for alien relative",
  },
  {
    code: "I-140",
    name: "Worker petition",
    description: "Immigrant petition for worker",
  },
  {
    code: "I-485",
    name: "Green card",
    description: "Adjustment of status",
  },
  {
    code: "I-765",
    name: "Work permit",
    description: "Employment authorization",
  },
  {
    code: "I-751",
    name: "Remove conditions",
    description: "On permanent residence",
  },
  {
    code: "N-400",
    name: "Citizenship",
    description: "Application for naturalization",
  },
] as const;

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

  const featured = HIGHLIGHT_FORMS.map((item) => {
    const form = getForm(item.code);
    return {
      ...item,
      href: form ? `/forms/${form.trackerSlug}` : "/forms/i485-tracker",
    };
  });

  return (
    <>
      <section className="hero">
        <div className="shell">
          <span className="eyebrow">Free USCIS case tracking</span>
          <h1>Find out what your case status actually means</h1>
          <p className="lede">
            USCIS gives you one line of text. We tell you what it means, how many
            cases sit ahead of yours, and roughly when something is likely to
            happen — with the math shown.
          </p>

          <HomeLookup />

          <div className="assur">
            <span>
              <span className="tick">✓</span> No account needed
            </span>
            <span>
              <span className="tick">✓</span> Free, with no locked results
            </span>
            <span>
              <span className="tick">✓</span> English and Spanish
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head center">
            <span className="eyebrow">What you&apos;ll see</span>
            <h2>Your place in a line of thousands</h2>
            <p>
              Cases filed around the same time as yours share a receipt block. We
              watch the whole block, so we can show you how many cases are
              genuinely ahead of you — and how fast they&apos;re clearing.
            </p>
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
                  In progress
                </span>
                <span className="form-chip">I-140</span>
              </div>
              <h3>USCIS is currently processing your case</h3>
              <p className="pv-sub">
                Day 206 since receipt · Block IOE09351 · 4,962 cases tracked
              </p>

              <div className="qtrack">
                <div
                  className="qbar"
                  role="img"
                  aria-label="Of 1,307 cases ahead: 555 approved, 160 denied, 577 still active. 3,654 behind."
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
                  <b>555</b> ahead, approved
                </span>
                <span>
                  <span className="sw sw-error" />
                  <b>160</b> ahead, denied
                </span>
                <span>
                  <span className="sw sw-sky" />
                  <b>577</b> ahead, still waiting
                </span>
                <span>
                  <span className="sw sw-neutral" />
                  <b>3,654</b> behind you
                </span>
              </div>

              <p className="pv-caption">
                Only <b>577 cases</b> are truly ahead of this one — not 1,307. At
                the block&apos;s recent pace of about 46 decisions a week,
                that&apos;s <b>roughly 3–7 months</b>. Every page shows the
                arithmetic behind its estimate, so you can check it yourself.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="shell">
          <div className="section-head">
            <span className="eyebrow">Three questions, answered</span>
            <h2>The things you actually want to know</h2>
          </div>
          <div className="grid3">
            <div className="fcard">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M4 5h16M4 12h10M4 19h7" />
                </svg>
              </div>
              <h3>What does this status mean?</h3>
              <p>
                Every USCIS status, translated into a sentence a person can read
                — plus what usually comes next, and whether you need to do
                anything. Most of the time, you don&apos;t.
              </p>
            </div>
            <div className="fcard">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M3 12h4l3-7 4 14 3-7h4" />
                </svg>
              </div>
              <h3>How far along am I?</h3>
              <p>
                Your position in your receipt block, with the cases ahead split
                into decided and still-waiting. It&apos;s the difference between
                &quot;1,307 people ahead&quot; and the truer &quot;577.&quot;
              </p>
            </div>
            <div className="fcard">
              <div className="ic">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <h3>When will something happen?</h3>
              <p>
                A range built from your block&apos;s real decision pace, shown
                alongside the official USCIS published times — and always with
                the calculation in view, never a black box.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <span className="eyebrow">Supported forms</span>
            <h2>Track any USCIS receipt number</h2>
            <p>
              If USCIS issued a receipt for it, we can read it. These are the
              forms people look up most.
            </p>
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
          <span className="eyebrow">How we work</span>
          <h2>Waiting is hard enough without being sold to</h2>
          <p className="lede">
            Plenty of sites will show you a blurred number and ask for your card.
            We think that&apos;s a bad way to treat someone who&apos;s been
            waiting fourteen months for news. So here&apos;s what we promise.
          </p>
          <div className="promises">
            <div className="promise">
              <h4>Your own case is never paywalled</h4>
              <p>
                Every figure about your case — position, pace, estimate, history
                — is free and always will be. Nothing about you sits behind a
                lock.
              </p>
            </div>
            <div className="promise">
              <h4>We show the arithmetic</h4>
              <p>
                No confidence scores you can&apos;t check. Every estimate comes
                with the numbers that produced it, so you can disagree with us if
                you want to.
              </p>
            </div>
            <div className="promise">
              <h4>We say when we don&apos;t know</h4>
              <p>
                USCIS doesn&apos;t decide cases in strict order, and it hides
                case history before we start tracking. We tell you where our data
                has gaps instead of papering over them.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="ctaband">
            <div>
              <h2>We&apos;ll watch it so you don&apos;t have to</h2>
              <p>
                Most people check their case every day for months and see the
                same sentence. Give us an email address and we&apos;ll write only
                when USCIS actually changes something — or when your position in
                line moves meaningfully.
              </p>
            </div>
            <HomeAlertCta />
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="shell">
          <div className="section-head">
            <span className="eyebrow">Common questions</span>
            <h2>Before you type in your receipt number</h2>
          </div>
          <div className="faq">
            <details open>
              <summary>Is this an official government site?</summary>
              <div className="a">
                No. uscasestatus is an independent service with no connection to
                USCIS, DHS, or any government agency. We read the same public
                status USCIS publishes and add context around it. The official
                tool is free at uscis.gov, and we&apos;d rather you know that.
              </div>
            </details>
            <details>
              <summary>Where does the data come from?</summary>
              <div className="a">
                Case statuses come from the official USCIS case status system.
                Queue and pace figures come from the cases we&apos;ve observed in
                your receipt block over time. Published processing times come
                from USCIS&apos;s own published ranges. Every page names its
                sources.
              </div>
            </details>
            <details>
              <summary>Do you store my receipt number?</summary>
              <div className="a">
                Only if you ask us to — by setting an alert or claiming the case.
                A one-off lookup isn&apos;t tied to you. We never sell or share
                receipt numbers, and we never send anything to USCIS on your
                behalf.
              </div>
            </details>
            <details>
              <summary>Can you tell me if my case will be approved?</summary>
              <div className="a">
                No, and be careful of anyone who says they can. We can show you
                how cases like yours have been decided historically, which is
                useful context — but it describes a group, not you. For advice
                about your case, talk to a licensed immigration attorney.
              </div>
            </details>
            <details>
              <summary>
                My status hasn&apos;t changed in months. Is something wrong?
              </summary>
              <div className="a">
                Usually not. Long stretches with no change are normal, and USCIS
                only publishes a case&apos;s current status, not its progress.
                Your case page will show you how your wait compares to others in
                your block, which is a better signal than the status line alone.
              </div>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}
