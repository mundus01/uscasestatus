import { apiError, apiSuccess } from "@/lib/api";
import { checkCase } from "@/lib/check-case";
import { toCaseApiResponse } from "@/lib/case-response";
import {
  REFRESH_COOLDOWN_MS,
  getRefreshCooldownUntil,
  setRefreshCooldown,
} from "@/lib/freshness";
import { isLocale } from "@/i18n/routing";
import { getClientIdentifier, rateLimit } from "@/lib/ratelimit";
import { receiptParamSchema, refreshBodySchema } from "@/lib/schemas/case";
import { validateReceipt } from "@/lib/receipt";

type RouteContext = {
  params: Promise<{ receipt: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const identifier = getClientIdentifier(request.headers);
  const ipLimit = await rateLimit("refresh_ip", identifier);

  if (!ipLimit.success) {
    return apiError(
      "rate_limited",
      "Too many refreshes from this network. Try again later.",
      429,
      {
        "Retry-After": String(
          Math.max(1, Math.ceil((ipLimit.reset - Date.now()) / 1000)),
        ),
      },
    );
  }

  const { receipt: rawReceipt } = await context.params;
  const parsedReceipt = receiptParamSchema.safeParse(rawReceipt);
  if (!parsedReceipt.success) {
    return apiError("invalid_receipt", "Malformed receipt number.", 422);
  }

  const validation = validateReceipt(parsedReceipt.data);
  if (!validation.ok) {
    return apiError(
      "invalid_receipt",
      "Enter a valid 13-character USCIS receipt number.",
      422,
    );
  }

  const receiptLimit = await rateLimit(
    "refresh_receipt",
    validation.receipt,
  );
  if (!receiptLimit.success) {
    const until =
      (await getRefreshCooldownUntil(validation.receipt)) ??
      new Date(receiptLimit.reset).toISOString();
    return apiError(
      "rate_limited",
      "This case was refreshed recently. Please wait before checking again.",
      429,
      {
        "Retry-After": String(
          Math.max(1, Math.ceil((receiptLimit.reset - Date.now()) / 1000)),
        ),
        "X-Next-Refresh-At": until,
      },
    );
  }

  let locale: "en" | "es" = "en";
  try {
    const json: unknown = await request.json();
    const body = refreshBodySchema.parse(json);
    if (body.locale && isLocale(body.locale)) {
      locale = body.locale;
    }
  } catch {
    // Empty body is fine.
  }

  const before = await checkCase(validation.receipt, locale);
  const previousStatus = before.ok ? before.data.statusTextEn : null;

  const result = await checkCase(validation.receipt, locale, {
    bypassCache: true,
  });

  const until = new Date(Date.now() + REFRESH_COOLDOWN_MS).toISOString();
  await setRefreshCooldown(validation.receipt, until);

  if (!result.ok) {
    // Upstream failed — return cached if we have it (§7).
    if (before.ok) {
      const data = await toCaseApiResponse(before.data, { isStale: true });
      data.freshness.nextRefreshAvailableAt = until;
      return apiSuccess(
        { ...data, changed: false },
        {
          status: 503,
          headers: {
            "X-Case-Stale": "1",
            "X-Next-Refresh-At": until,
          },
        },
      );
    }
    return apiError(result.code, result.message, result.code === "not_found" ? 404 : 503);
  }

  const changed =
    previousStatus != null && previousStatus !== result.data.statusTextEn;
  const data = await toCaseApiResponse(result.data, {
    isStale: result.data.isStale,
  });
  data.freshness.nextRefreshAvailableAt = until;

  return apiSuccess(
    { ...data, changed },
    {
      headers: {
        "X-Case-Source": result.data.source,
        "X-Next-Refresh-At": until,
      },
    },
  );
}
