import "server-only";

import { getUscisEnv } from "@/lib/env";
import { getUscisAccessToken } from "@/lib/uscis/auth";
import { normalizeFormType } from "@/lib/uscis/form-type";
import { getMockUscisCase } from "@/lib/uscis/mock";
import type {
  UscisCasePayload,
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

type RawResponse = {
  case_status?: RawCaseStatus;
  message?: string;
};

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
      return {
        ok: false,
        code: "not_found",
        message: "USCIS has no case for this receipt number.",
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        code: "unauthorized",
        message: "USCIS rejected our API credentials.",
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        code: "upstream",
        message: `USCIS returned HTTP ${response.status}.`,
      };
    }

    const json = (await response.json()) as RawResponse;
    const parsed = parseCaseStatus(json, receipt);
    if (!parsed) {
      return {
        ok: false,
        code: "invalid_response",
        message: "USCIS returned an unexpected response shape.",
      };
    }

    return { ok: true, data: parsed, source: "live" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown USCIS fetch error";
    return { ok: false, code: "upstream", message };
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
