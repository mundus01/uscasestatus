import "server-only";

import { getUscisEnv } from "@/lib/env";
import { getUscisAccessToken } from "@/lib/uscis/auth";
import { normalizeFormType } from "@/lib/uscis/form-type";
import { getMockUscisCase } from "@/lib/uscis/mock";
import type {
  UscisCasePayload,
  UscisFetchErrorCode,
  UscisFetchResult,
  UscisHistoryEvent,
} from "@/lib/uscis/types";

export { normalizeFormType } from "@/lib/uscis/form-type";

type RawHistoryEntry = {
  date?: string;
  completed_text_en?: string;
  completed_text_es?: string;
  completedDateText_en?: string;
  completedDateText_es?: string;
};

type RawCaseStatus = {
  receiptNumber?: string;
  formType?: string;
  submittedDate?: string;
  modifiedDate?: string;
  current_case_status_text_en?: string;
  current_case_status_text_es?: string;
  current_case_status_desc_en?: string;
  current_case_status_desc_es?: string;
  hist_case_status?: RawHistoryEntry[] | null;
};

type RawUscisError = {
  code?: string;
  message?: string;
  category?: string;
  reference?: string;
  status?: string | number;
  traceId?: string;
};

type RawResponse = {
  case_status?: RawCaseStatus;
  message?: string;
  errors?: RawUscisError[];
};

/**
 * Prefer USCIS RFC-9457 `errors[].message` (sandbox/demo requirement).
 * Falls back to a top-level `message` when present.
 */
export function messageFromUscisErrorBody(
  body: unknown,
  fallback: string,
): string {
  if (!body || typeof body !== "object") return fallback;

  const record = body as RawResponse;
  const fromErrors = Array.isArray(record.errors)
    ? record.errors
        .map((entry) =>
          typeof entry?.message === "string" ? entry.message.trim() : "",
        )
        .filter(Boolean)
    : [];

  if (fromErrors.length > 0) return fromErrors.join(" ");

  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim();
  }

  return fallback;
}

async function readUscisErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const json: unknown = await response.json();
    return messageFromUscisErrorBody(json, fallback);
  } catch {
    return fallback;
  }
}

function errorResult(
  code: UscisFetchErrorCode,
  message: string,
): UscisFetchResult {
  return { ok: false, code, message };
}

/**
 * Fetches a case from the official USCIS Case Status API.
 * Falls back to mock fixtures when credentials are not configured.
 */
export async function fetchUscisCase(receipt: string): Promise<UscisFetchResult> {
  const env = getUscisEnv();

  if (!env) {
    return {
      ok: true,
      data: getMockUscisCase(receipt),
      source: "mock",
    };
  }

  try {
    const token = await getUscisAccessToken();
    const response = await fetch(`${env.baseUrl}/case-status/${receipt}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      const message = await readUscisErrorMessage(
        response,
        "USCIS has no case for this receipt number.",
      );
      return errorResult("not_found", message);
    }

    if (response.status === 401 || response.status === 403) {
      const message = await readUscisErrorMessage(
        response,
        "USCIS rejected our API credentials.",
      );
      return errorResult("unauthorized", message);
    }

    if (!response.ok) {
      const message = await readUscisErrorMessage(
        response,
        `USCIS returned HTTP ${response.status}.`,
      );
      return errorResult("upstream", message);
    }

    const json = (await response.json()) as RawResponse;

    // Some error payloads may still arrive with HTTP 200.
    if (Array.isArray(json.errors) && json.errors.length > 0 && !json.case_status) {
      return errorResult(
        "upstream",
        messageFromUscisErrorBody(json, "USCIS returned an error response."),
      );
    }

    const parsed = parseCaseStatus(json, receipt);
    if (!parsed) {
      return errorResult(
        "invalid_response",
        messageFromUscisErrorBody(
          json,
          "USCIS returned an unexpected response shape.",
        ),
      );
    }

    return { ok: true, data: parsed, source: "live" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown USCIS fetch error";
    return errorResult("upstream", message);
  }
}

function parseCaseStatus(
  json: RawResponse,
  fallbackReceipt: string,
): UscisCasePayload | null {
  const raw = json.case_status;
  if (!raw?.current_case_status_text_en) return null;

  return {
    receiptNumber: raw.receiptNumber ?? fallbackReceipt,
    formType: normalizeFormType(raw.formType),
    submittedDate: raw.submittedDate ?? null,
    modifiedDate: raw.modifiedDate ?? null,
    statusText: {
      en: raw.current_case_status_text_en,
      es: raw.current_case_status_text_es ?? raw.current_case_status_text_en,
    },
    statusDescription: {
      en: raw.current_case_status_desc_en ?? "",
      es: raw.current_case_status_desc_es ?? raw.current_case_status_desc_en ?? "",
    },
    history: parseHistory(raw.hist_case_status),
  };
}

function parseHistory(
  history: RawHistoryEntry[] | null | undefined,
): UscisHistoryEvent[] {
  if (!Array.isArray(history)) return [];

  return history
    .map((entry) => {
      const statusText =
        entry.completed_text_en ?? entry.completedDateText_en ?? "";
      if (!statusText) return null;

      return {
        date: entry.date ?? null,
        statusText,
        statusDescription: entry.completed_text_es ?? null,
      } satisfies UscisHistoryEvent;
    })
    .filter((entry): entry is UscisHistoryEvent => entry !== null);
}
