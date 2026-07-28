import { z } from "zod";

export const receiptParamSchema = z
  .string()
  .trim()
  .min(1)
  .max(32);

export const localeQuerySchema = z.enum(["en", "es"]).default("en");

export const refreshBodySchema = z
  .object({
    locale: z.enum(["en", "es"]).optional(),
  })
  .optional()
  .default({});

export const caseResponseSchema = z.object({
  receipt: z.object({
    normalized: z.string(),
    display: z.string(),
  }),
  form: z.object({
    type: z.string().nullable(),
    subtype: z.string().nullable(),
    labelKey: z.string().nullable(),
  }),
  office: z.object({
    code: z.string().nullable(),
    name: z.string().nullable(),
    kind: z.enum(["service_center", "field_office"]),
  }),
  status: z.object({
    code: z.string(),
    stage: z.string(),
    severity: z.string(),
    isTerminal: z.boolean(),
    label: z.string(),
    means: z.string(),
    rawMessage: z.string(),
    reportedAt: z.string().nullable(),
    observedAt: z.string(),
  }),
  timeline: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(["completed", "current", "expected"]),
      label: z.string(),
      reportedAt: z.string().nullable(),
      isCurrent: z.boolean(),
      isProjected: z.boolean(),
    }),
  ),
  elapsed: z.object({
    mode: z.enum(["pending", "decided"]),
    months: z.number().nullable(),
    referenceStart: z.string().nullable(),
    referenceStartSource: z
      .enum(["receipt_notice", "first_event", "user"])
      .nullable(),
    isEstimated: z.boolean(),
  }),
  publishedRange: z
    .object({
      lowerMonths: z.number(),
      upperMonths: z.number(),
      position: z.enum(["within", "over", "under", "unknown"]),
      sourceLabel: z.string(),
    })
    .nullable(),
  forecast: z.null(),
  cohort: z.null(),
  freshness: z.object({
    lastCheckedAt: z.string(),
    isStale: z.boolean(),
    nextRefreshAvailableAt: z.string(),
  }),
  meta: z.object({
    dataSources: z.array(z.string()),
    generatedAt: z.string(),
    source: z.enum(["live", "cache", "mock"]),
  }),
});

export type CaseApiResponse = z.infer<typeof caseResponseSchema>;
