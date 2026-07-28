import type { CheckCaseSuccess } from "@/lib/check-case";
import {
  buildFreshnessInfo,
  getRefreshCooldownUntil,
} from "@/lib/freshness";
import { formatReceipt, getServiceCenterName } from "@/lib/receipt";
import type { CaseApiResponse } from "@/lib/schemas/case";

export async function toCaseApiResponse(
  data: CheckCaseSuccess,
  options?: { isStale?: boolean },
): Promise<CaseApiResponse> {
  const cooldownUntil = await getRefreshCooldownUntil(data.receipt);
  const freshness = buildFreshnessInfo({
    lastCheckedAt: data.checkedAt,
    isStale: options?.isStale ?? false,
    nextRefreshAvailableAt: cooldownUntil,
  });

  const officeName = getServiceCenterName(data.receipt);

  return {
    receipt: {
      normalized: data.receipt,
      display: formatReceipt(data.receipt),
    },
    form: {
      type: data.formType,
      subtype: null,
      labelKey: data.formType,
    },
    office: {
      code: data.prefix,
      name: officeName,
      kind: "service_center",
    },
    status: {
      code: data.statusCode,
      stage: data.statusDef.stage,
      severity: data.statusDef.severity,
      isTerminal: data.isTerminal,
      label: data.statusText,
      means: data.plainEnglish,
      rawMessage: data.statusDescription,
      reportedAt: data.modifiedDate,
      observedAt: data.checkedAt,
    },
    timeline: data.caseTimeline.nodes.map((node) => ({
      id: node.id,
      kind: node.kind,
      label: node.label,
      reportedAt: node.dateIso,
      isCurrent: node.kind === "current",
      isProjected: node.kind === "expected",
    })),
    elapsed: {
      mode: data.processingTime?.elapsed.mode ?? (data.isTerminal ? "decided" : "pending"),
      months: data.processingTime?.elapsed.months ?? null,
      referenceStart: data.processingTime?.elapsed.referenceStart ?? null,
      referenceStartSource:
        data.processingTime?.elapsed.referenceStartSource ?? null,
      isEstimated: data.processingTime?.elapsed.isEstimated ?? false,
    },
    publishedRange: data.processingTime
      ? {
          lowerMonths: data.processingTime.lowMonths,
          upperMonths: data.processingTime.highMonths,
          position: data.processingTime.position,
          sourceLabel: data.processingTime.sourceLabel,
        }
      : null,
    forecast: null,
    cohort: null,
    freshness: {
      lastCheckedAt: freshness.lastCheckedAt,
      isStale: freshness.isStale,
      nextRefreshAvailableAt: freshness.nextRefreshAvailableAt,
    },
    meta: {
      dataSources: [
        data.source === "mock" ? "mock_fixture" : "uscis_case_status_api",
        "published_uscis_processing_times",
      ],
      generatedAt: new Date().toISOString(),
      source: data.source,
    },
  };
}
