import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import {
  NationwidePaceChart,
  WeeklyBlockChart,
} from "@/components/case/block-charts";
import { CaseActions } from "@/components/case/case-actions";
import { CaseError } from "@/components/case/case-error";
import { ClaimStrip } from "@/components/case/claim-strip";
import { EstimateCard } from "@/components/case/estimate-card";
import { FreshnessIndicator } from "@/components/case/freshness-indicator";
import { QueueCard } from "@/components/case/queue-card";
import { TrackForm } from "@/components/case/track-form";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAnswerSentence } from "@/lib/case-answer";
import { checkCase } from "@/lib/check-case";
import { receiptBlock } from "@/lib/filing-date";
import {
  buildFreshnessInfo,
  getRefreshCooldownUntil,
} from "@/lib/freshness";
import { getForm } from "@/lib/forms";
import { getNextSteps } from "@/lib/next-steps";
import { getNearbySummary } from "@/lib/neighbors";
import { MIN_CELL_SIZE } from "@/lib/privacy";
import { getServiceCenterName, validateReceipt } from "@/lib/receipt";
import { getClientIdentifier, rateLimit } from "@/lib/ratelimit";
import { parseUscisDate } from "@/lib/uscis/dates";

export async function generateMetadata(
  props: PageProps<"/[locale]/case/[receipt]">,
): Promise<Metadata> {
  const { locale, receipt } = await props.params;
  const t = await getTranslations({ locale, namespace: "case" });
  const validation = validateReceipt(receipt);

  return {
    title: t("title", {
      receipt: validation.ok ? validation.receipt : receipt,
    }),
    robots: { index: false, follow: false },
  };
}

export default async function CasePage({
  params,
}: PageProps<"/[locale]/case/[receipt]">) {
  const { locale, receipt } = await params;
  setRequestLocale(locale);

  const validation = validateReceipt(receipt);
  if (!validation.ok) {
    notFound();
  }

  const t = await getTranslations("case");
  const tStatus = await getTranslations("status");
  const tErrors = await getTranslations("errors");
  const tFooter = await getTranslations("footer");
  const activeLocale = locale as Locale;

  const requestHeaders = await headers();
  const limit = await rateLimit("check", getClientIdentifier(requestHeaders));

  if (!limit.success) {
    return (
      <CaseError
        title={t("errors.rateLimitedTitle")}
        body={t("errors.rateLimitedBody")}
        retryLabel={t("errors.tryAnother")}
        homeLabel={tErrors("backHome")}
      />
    );
  }

  const result = await checkCase(validation.receipt, activeLocale);

  if (!result.ok) {
    if (result.code === "not_found") {
      const uscisMessage = result.message.trim();
      const defaultNotFound = t("errors.notFoundBody");
      const body =
        uscisMessage &&
        uscisMessage !== "USCIS has no case for this receipt number."
          ? uscisMessage
          : defaultNotFound;
      return (
        <CaseError
          title={t("errors.notFoundTitle")}
          body={body}
          retryLabel={t("errors.tryAnother")}
          homeLabel={tErrors("backHome")}
          reasonsTitle={t("errors.notFoundReasonsTitle")}
          reasons={[
            t("errors.notFoundReason1"),
            t("errors.notFoundReason2"),
            t("errors.notFoundReason3"),
          ]}
          trackWhenAvailableTitle={t("errors.notifyTitle")}
          trackWhenAvailableBody={t("errors.notifyBody")}
        />
      );
    }

    return (
      <CaseError
        title={t("errors.upstreamTitle")}
        body={result.message || t("errors.upstreamBody")}
        retryLabel={t("errors.tryAnother")}
        homeLabel={tErrors("backHome")}
      />
    );
  }

  const data = result.data;
  const form = data.formType ? getForm(data.formType) : undefined;
  const office = getServiceCenterName(data.receipt) ?? t("unknownOffice");
  const processing = data.processingTime;
  const nearby = await getNearbySummary(data.receipt);
  const block = receiptBlock(data.receipt);
  const serial = Number(data.receipt.slice(3)) || 0;
  const cooldownUntil = await getRefreshCooldownUntil(data.receipt);
  const freshness = buildFreshnessInfo({
    lastCheckedAt: data.checkedAt,
    isStale: data.isStale,
    nextRefreshAvailableAt: cooldownUntil,
  });
  const nextSteps = getNextSteps(
    data.statusCode,
    activeLocale,
    t("nextSteps.citation"),
  );

  const answer = buildAnswerSentence({
    statusLabel: data.statusText,
    statusDef: data.statusDef,
    processing,
    checkedAt: data.checkedAt,
    locale: activeLocale,
    copy: {
      decided: ({ date, outcome, months }) =>
        t("answer.decided", { date, outcome, months }),
      pendingDays: ({ days }) => t("answer.pendingDays", { days }),
      pendingOver: ({ days }) => t("answer.pendingOver", { days }),
      unknown: ({ status }) => t("answer.unknown", { status }),
    },
  });

  const dayMatch = answer.match(/Day\s+(\d+)/i);
  const dayCount =
    dayMatch?.[1] ??
    (processing?.elapsed.months != null
      ? String(Math.max(1, Math.round(processing.elapsed.months * 30.44)))
      : null);

  const received = parseUscisDate(data.submittedDate);
  const receivedLabel = received
    ? received.toLocaleDateString(activeLocale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : "—";

  const checkedRelative =
    data.source === "mock"
      ? "Demo data"
      : data.source === "cache"
        ? "Checked recently"
        : "Live from USCIS";

  const checkedWhen = new Date(data.checkedAt).toLocaleString(activeLocale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });

  const toneLabel = tStatus(data.tone);
  const sampleSize = nearby?.sampleSize ?? 0;
  const pendingAhead =
    nearby?.sufficient === true ? nearby.pending : null;
  const corpusInsufficientBody = t("corpus.insufficientBody", {
    threshold: MIN_CELL_SIZE,
    n: sampleSize,
  });
  const chartInsufficientBody = t("corpus.chartInsufficient", {
    n: sampleSize,
    threshold: MIN_CELL_SIZE,
  });

  const timelineNodes = data.caseTimeline.nodes;

  return (
    <div className="shell">
      {data.source === "mock" ? (
        <div className="nudge" style={{ marginBottom: "1rem" }}>
          <span className="ic">i</span>
          <div>
            <b>Demo mode.</b> {t("mockBannerBody")}
          </div>
        </div>
      ) : null}

      {data.isStale ? (
        <div className="nudge" style={{ marginBottom: "1rem" }}>
          <span className="ic">!</span>
          <div>{t("errors.staleBanner")}</div>
        </div>
      ) : null}

      <section className="case-hero">
        <div className="case-hero-top">
          <span className="status-pill">
            <span className="dot" />
            {toneLabel}
          </span>
          {data.formType ? (
            <span className="form-chip">{data.formType}</span>
          ) : null}
          {form ? (
            <span className="text-small grey">
              {form.commonName[activeLocale]}
            </span>
          ) : null}
        </div>
        <h1>{data.statusText}</h1>
        <div className="receipt">{data.receipt}</div>
        <div className="case-hero-facts">
          <div className="fact">
            <div className="k">Filed with</div>
            <div className="v">
              {office}
              <small>Receipt block {block}</small>
            </div>
          </div>
          <div className="fact">
            <div className="k">Received</div>
            <div className="v">
              {receivedLabel}
              {received ? (
                <small>
                  Filed{" "}
                  {received.toLocaleDateString(activeLocale, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </small>
              ) : null}
            </div>
          </div>
          <div className="fact">
            <div className="k">Status check</div>
            <div className="v">
              {checkedRelative}
              <small>
                {checkedWhen} ·{" "}
                <FreshnessIndicator
                  receipt={data.receipt}
                  lastCheckedAt={data.checkedAt}
                  relativeLabel={checkedWhen}
                  staleLabel={t("checked.stale", { date: checkedWhen })}
                  checkAgainLabel={t("checked.checkAgain")}
                  checkingLabel={t("checked.checking")}
                  waitLabelTemplate={t("checked.waitSeconds", {
                    seconds: "{seconds}",
                  })}
                  isStale={freshness.isStale}
                  nextRefreshAvailableAt={freshness.nextRefreshAvailableAt}
                  locale={activeLocale}
                />
              </small>
            </div>
          </div>
        </div>
      </section>

      <ClaimStrip sampleSize={sampleSize} />
      {/* Claim modal is mounted in the locale layout for header CTAs. */}

      {dayCount ? (
        <h2 className="daycount">
          Day <em>{dayCount}</em> since receipt.
        </h2>
      ) : (
        <h2 className="daycount">{answer}</h2>
      )}

      <section className="card">
        <div className="card-h">
          <h3>{t("plainEnglishTitle")}</h3>
        </div>
        <div className="card-b">
          <p>{data.plainEnglish}</p>
        </div>
      </section>

      <div className="next">
        <h3>{t("whatToDoTitle")}</h3>
        <ol>
          {nextSteps.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <div className="legal">{tFooter("notLegalAdvice")}</div>
      </div>

      <QueueCard
        block={block}
        receiptSerial={serial}
        nearby={nearby}
        title={t("corpus.queueTitle")}
        insufficientTitle={t("corpus.insufficientTitle")}
        insufficientBody={corpusInsufficientBody}
      />

      <EstimateCard
        processing={processing}
        pendingAhead={pendingAhead}
        pacePerWeek={null}
        title={t("corpus.estimateTitle")}
        publishedOnlyBody={t("corpus.estimatePublishedOnly")}
        noPaceBody={t("corpus.estimateNoPace")}
      />

      <div className="charts">
        <WeeklyBlockChart
          sampleSize={sampleSize}
          title={t("corpus.weeklyChartTitle")}
          insufficientBody={chartInsufficientBody}
        />
        <NationwidePaceChart
          formType={data.formType}
          sampleSize={sampleSize}
          title={t("corpus.nationwideChartTitle")}
          insufficientBody={chartInsufficientBody}
        />
      </div>

      <section className="card">
        <div className="card-h">
          <h3>Status history</h3>
        </div>
        <div className="card-b">
          <ul className="tl">
            {timelineNodes.map((node) => (
              <li
                key={node.id}
                className={node.kind === "expected" ? "future" : undefined}
              >
                <div
                  className="t"
                  style={
                    node.kind === "expected"
                      ? { color: "var(--text-light)" }
                      : undefined
                  }
                >
                  {node.label.includes(" ")
                    ? node.label
                    : t(`timeline.${node.stageId ?? "review"}` as "timeline.review")}
                </div>
                <div className="d">
                  {node.dateIso
                    ? `${new Date(node.dateIso).toLocaleDateString(activeLocale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        timeZone: "UTC",
                      })} · ${
                        node.dateSource === "observed"
                          ? t("timeline.detectedByUs")
                          : t("timeline.reportedByUscis")
                      }`
                    : null}
                  {node.kind === "current" ? " · Current status" : null}
                  {node.kind === "expected" && !node.dateIso
                    ? "Typically follows"
                    : null}
                </div>
              </li>
            ))}
          </ul>
          {data.caseTimeline.singleEventNote ? (
            <div className="tl-note">
              {t("timeline.singleEventNote", {
                date: new Date(
                  data.caseTimeline.trackingStartedAt ?? data.checkedAt,
                ).toLocaleDateString(activeLocale, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
              })}
            </div>
          ) : null}
        </div>
      </section>

      <TrackForm
        receipt={data.receipt}
        locale={activeLocale}
        title={t("track.title")}
        body={t("track.body")}
        emailLabel={t("track.emailLabel")}
        emailPlaceholder={t("track.emailPlaceholder")}
        submitLabel={t("track.submit")}
        submittingLabel={t("track.submitting")}
        successConfirm={t("track.successConfirm")}
        successAlready={t("track.successAlready")}
        errorGeneric={t("track.errorGeneric")}
      />

      <CaseActions receipt={data.receipt} />

      <p className="method">
        Status checked{" "}
        {new Date(data.checkedAt).toLocaleString(activeLocale, {
          timeZone: "UTC",
        })}
        . Queue and pace figures come from cases we observe in receipt block{" "}
        {block}. Estimates are ranges, not promises, and are explained on our{" "}
        <Link href="/methodology">methodology page</Link>.
      </p>
    </div>
  );
}
