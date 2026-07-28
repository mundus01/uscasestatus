import { apiError, apiSuccess } from "@/lib/api";
import { checkCase } from "@/lib/check-case";
import { toCaseApiResponse } from "@/lib/case-response";
import { isLocale } from "@/i18n/routing";
import { getClientIdentifier, rateLimit } from "@/lib/ratelimit";
import { localeQuerySchema, receiptParamSchema } from "@/lib/schemas/case";
import { validateReceipt } from "@/lib/receipt";

type RouteContext = {
  params: Promise<{ receipt: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const identifier = getClientIdentifier(request.headers);
  const limit = await rateLimit("check", identifier);

  if (!limit.success) {
    return apiError(
      "rate_limited",
      "Too many status checks. Please wait a few minutes and try again.",
      429,
      {
        "Retry-After": String(
          Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000)),
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

  const url = new URL(request.url);
  const localeParsed = localeQuerySchema.safeParse(
    url.searchParams.get("locale") ?? "en",
  );
  const locale = localeParsed.success ? localeParsed.data : "en";
  if (!isLocale(locale)) {
    return apiError("invalid_locale", "Unsupported locale.", 400);
  }

  const result = await checkCase(validation.receipt, locale);

  if (!result.ok) {
    const status =
      result.code === "not_found"
        ? 404
        : result.code === "invalid_receipt"
          ? 422
          : result.code === "rate_limited"
            ? 429
            : 503;
    return apiError(result.code, result.message, status);
  }

  const data = await toCaseApiResponse(result.data, {
    isStale: result.data.isStale,
  });

  return apiSuccess(data, {
    status: result.data.isStale ? 503 : 200,
    headers: {
      "X-Case-Source": result.data.source,
      "X-Case-Stale": result.data.isStale ? "1" : "0",
    },
  });
}
