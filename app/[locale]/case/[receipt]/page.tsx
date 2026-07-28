import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { AnswerBand } from "@/components/case/answer-band";
import { CaseActions } from "@/components/case/case-actions";
import { CaseError } from "@/components/case/case-error";
import {
  ExplanationSection,
  OfficialUscisText,
} from "@/components/case/explanation-section";
import { FreshnessIndicator } from "@/components/case/freshness-indicator";
import { NearbySummaryCard } from "@/components/case/nearby-summary";
import { ProcessingTimeCard } from "@/components/case/processing-time";
import { StatusCard } from "@/components/case/status-card";
import { CaseTimeline } from "@/components/case/timeline";
import { TrackForm } from "@/components/case/track-form";
import { WhatToDoNext } from "@/components/case/what-to-do-next";
import { Callout } from "@/components/ui/callout";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buildAnswerSentence } from "@/lib/case-answer";
import { checkCase } from "@/lib/check-case";
import { getForm } from "@/lib/forms";
import {
  buildFreshnessInfo,
  getRefreshCooldownUntil,
} from "@/lib/freshness";
import { getNextSteps } from "@/lib/next-steps";
import { getNearbySummary } from "@/lib/neighbors";
import {
  formatReceipt,
  getServiceCenterName,
  validateReceipt,
} from "@/lib/receipt";
import { getClientIdentifier, rateLimit } from "@/lib/ratelimit";

export async function generateMetadata(
  props: PageProps<"/[locale]/case/[receipt]">,
): Promise<Metadata> {
  const { locale, receipt } = await props.params;
  const t = await getTranslations({ locale, namespace: "case" });
  const validation = validateReceipt(receipt);

  return {
    title: t("title", {
      receipt: validation.ok ? formatReceipt(validation.receipt) : receipt,
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
      return (
        <CaseError
          title={t("errors.notFoundTitle")}
          body={t("errors.notFoundBody")}
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
        body={t("errors.upstreamBody")}
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

  const checkedRelative =
    data.source === "mock"
      ? t("checked.mock")
      : data.source === "cache"
        ? t("checked.cached")
        : t("checked.liveAt", {
            time: new Date(data.checkedAt).toLocaleString(activeLocale),
          });

  const staleLabel = t("checked.stale", {
    date: new Date(data.checkedAt).toLocaleString(activeLocale),
  });

  const positionLabel =
    processing == null
      ? ""
      : processing.position === "within"
        ? t("processing.within", {
            low: processing.lowMonths,
            high: processing.highMonths,
          })
        : processing.position === "under"
          ? t("processing.under", { low: processing.lowMonths })
          : processing.position === "over"
            ? t("processing.over", { high: processing.highMonths })
            : t("processing.unknownPosition");

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 md:px-6 md:py-14">
      {data.source === "mock" ? (
        <Callout tone="pending" title={t("mockBannerTitle")}>
          {t("mockBannerBody")}
        </Callout>
      ) : null}

      {data.isStale ? (
        <Callout tone="pending" assertive>
          {t("errors.staleBanner")}
        </Callout>
      ) : null}

      <StatusCard
        receipt={data.receipt}
        statusText={data.statusText}
        formType={data.formType}
        formLabel={form?.commonName[activeLocale] ?? null}
        tone={data.tone}
        toneLabel={tStatus(data.tone)}
        checkedLabel={t("checked.label")}
        freshness={
          <FreshnessIndicator
            receipt={data.receipt}
            lastCheckedAt={data.checkedAt}
            relativeLabel={checkedRelative}
            staleLabel={staleLabel}
            checkAgainLabel={t("checked.checkAgain")}
            checkingLabel={t("checked.checking")}
            waitLabel={(seconds) => t("checked.waitSeconds", { seconds })}
            isStale={freshness.isStale}
            nextRefreshAvailableAt={freshness.nextRefreshAvailableAt}
            locale={activeLocale}
          />
        }
        officeLabel={t("officeLabel")}
        office={office}
      />

      <AnswerBand sentence={answer} />

      <div className="space-y-4">
        <ExplanationSection
          plainEnglishTitle={t("plainEnglishTitle")}
          plainEnglish={data.plainEnglish}
        />
        <WhatToDoNext
          title={t("whatToDoTitle")}
          content={nextSteps}
          severity={data.statusDef.severity}
          notLegalAdvice={tFooter("notLegalAdvice")}
          citationFallbackLabel={t("nextSteps.citation")}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CaseTimeline
          title={t("timelineTitle")}
          model={data.caseTimeline}
          stageLabels={{
            received: t("timeline.received"),
            biometrics: t("timeline.biometrics"),
            review: t("timeline.review"),
            interview: t("timeline.interview"),
            decision: t("timeline.decision"),
            card: t("timeline.card"),
          }}
          codeLabels={{
            CARD_IN_PRODUCTION: t("timeline.card"),
            CARD_MAILED: t("timeline.card"),
            CARD_DELIVERED: t("timeline.card"),
          }}
          reportedByUscis={t("timeline.reportedByUscis")}
          detectedByUs={t("timeline.detectedByUs")}
          singleEventNote={(date) => t("timeline.singleEventNote", { date })}
          showAllLabel={(count) => t("timeline.showAll", { count })}
          showFewerLabel={t("timeline.showFewer")}
          locale={activeLocale}
        />

        {processing ? (
          <ProcessingTimeCard
            title={t("processingTitle")}
            context={processing}
            rangeLabel={t("processingRange", {
              form: processing.formType,
              low: processing.lowMonths,
              high: processing.highMonths,
            })}
            positionLabel={positionLabel}
            decidedLabel={
              processing.isTerminal && processing.elapsed.months != null
                ? t("processing.decidedTotal", {
                    months: processing.elapsed.months,
                  })
                : null
            }
            inquiryTitle={
              processing.position === "over" ? t("inquiry.title") : null
            }
            inquiryBody={
              processing.position === "over" ? t("inquiry.body") : null
            }
            inquiryLinkLabel={
              processing.position === "over" ? t("inquiry.link") : null
            }
            inquiryHref={
              processing.position === "over"
                ? "https://www.uscis.gov/tools/case-status-online"
                : null
            }
            sourceFooter={t("processing.sourceFooter")}
            disclaimer={t("processingDisclaimer")}
            insufficientLabel={t("processing.insufficient")}
          />
        ) : (
          <Callout tone="neutral" title={t("processingTitle")}>
            {t("processing.missingForm")}
          </Callout>
        )}
      </div>

      <OfficialUscisText
        title={t("officialTitle")}
        description={data.statusDescription}
      />

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

      <NearbySummaryCard
        title={t("nearby.title")}
        body={t("nearby.body", { count: nearby?.sampleSize ?? 0 })}
        summary={nearby}
        approvedLabel={t("nearby.approved")}
        pendingLabel={t("nearby.pending")}
        alertLabel={t("nearby.alert")}
        insufficientLabel={t("nearby.insufficient", {
          n: nearby?.sampleSize ?? 0,
          threshold: 5,
        })}
      />

      <CaseActions
        receipt={data.receipt}
        copyLabel={t("actions.copy")}
        copiedLabel={t("actions.copied")}
        uscisLabel={t("actions.uscis")}
        uscisHint={t("actions.uscisHint")}
      />

      <p className="text-xs text-ink-subtle">
        {t("sources.footer", {
          checkedAt: new Date(data.checkedAt).toLocaleString(activeLocale),
        })}{" "}
        <Link href="/methodology" className="underline">
          {t("sources.methodology")}
        </Link>
      </p>
    </div>
  );
}
