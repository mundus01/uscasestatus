import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { CaseError } from "@/components/case/case-error";
import { ExplanationSection } from "@/components/case/explanation-section";
import { ProcessingTimeCard } from "@/components/case/processing-time";
import { StatusCard } from "@/components/case/status-card";
import { CaseTimeline } from "@/components/case/timeline";
import { NearbySummaryCard } from "@/components/case/nearby-summary";
import { TrackForm } from "@/components/case/track-form";
import { Callout } from "@/components/ui/callout";
import { checkCase } from "@/lib/check-case";
import { getForm } from "@/lib/forms";
import type { Locale } from "@/i18n/routing";
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
    const title =
      result.code === "not_found"
        ? t("errors.notFoundTitle")
        : t("errors.upstreamTitle");
    const body =
      result.code === "not_found"
        ? t("errors.notFoundBody")
        : t("errors.upstreamBody");

    return (
      <CaseError
        title={title}
        body={body}
        retryLabel={t("errors.tryAnother")}
        homeLabel={tErrors("backHome")}
      />
    );
  }

  const data = result.data;
  const form = data.formType ? getForm(data.formType) : undefined;
  const office =
    getServiceCenterName(data.receipt) ?? t("unknownOffice");

  const checkedLabel =
    data.source === "mock"
      ? t("checked.mock")
      : data.source === "cache"
        ? t("checked.cached")
        : t("checked.live");

  const processing = data.processingTime;
  const nearby = await getNearbySummary(data.receipt);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 md:px-6 md:py-14">
      {data.source === "mock" ? (
        <Callout tone="pending" title={t("mockBannerTitle")}>
          {t("mockBannerBody")}
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
        sourceLabel={checkedLabel}
        officeLabel={t("officeLabel")}
        office={office}
      />

      <ExplanationSection
        plainEnglishTitle={t("plainEnglishTitle")}
        plainEnglish={data.plainEnglish}
        whatToDoTitle={t("whatToDoTitle")}
        whatToDo={data.whatToDo}
        officialTitle={t("officialTitle")}
        officialDescription={data.statusDescription}
        tone={data.tone}
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

      {nearby && nearby.sampleSize >= 5 ? (
        <NearbySummaryCard
          title={t("nearby.title")}
          body={t("nearby.body", { count: nearby.sampleSize })}
          summary={nearby}
          approvedLabel={t("nearby.approved")}
          pendingLabel={t("nearby.pending")}
          alertLabel={t("nearby.alert")}
        />
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <CaseTimeline
          title={t("timelineTitle")}
          steps={data.timeline}
          labels={{
            received: t("timeline.received"),
            biometrics: t("timeline.biometrics"),
            review: t("timeline.review"),
            interview: t("timeline.interview"),
            decision: t("timeline.decision"),
            card: t("timeline.card"),
          }}
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
            progressLabel={
              processing.monthsSinceFiled != null
                ? t("processingProgress", {
                    months: processing.monthsSinceFiled,
                  })
                : null
            }
            disclaimer={t("processingDisclaimer")}
          />
        ) : null}
      </div>
    </div>
  );
}
