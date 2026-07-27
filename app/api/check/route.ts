import { checkCase } from "@/lib/check-case";
import { apiError, apiSuccess } from "@/lib/api";
import { isLocale, type Locale } from "@/i18n/routing";
import { getClientIdentifier, rateLimit } from "@/lib/ratelimit";

type CheckBody = {
  receipt?: unknown;
  locale?: unknown;
};

export async function POST(request: Request) {
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
        "X-RateLimit-Limit": String(limit.limit),
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    );
  }

  let body: CheckBody;
  try {
    body = (await request.json()) as CheckBody;
  } catch {
    return apiError("invalid_json", "Request body must be JSON.", 400);
  }

  const receipt = typeof body.receipt === "string" ? body.receipt : "";
  const locale: Locale =
    typeof body.locale === "string" && isLocale(body.locale)
      ? body.locale
      : "en";

  const result = await checkCase(receipt, locale);

  if (!result.ok) {
    const status =
      result.code === "invalid_receipt"
        ? 400
        : result.code === "not_found"
          ? 404
          : result.code === "unauthorized"
            ? 502
            : 502;

    return apiError(result.code, result.message, status, {
      "X-RateLimit-Limit": String(limit.limit),
      "X-RateLimit-Remaining": String(limit.remaining),
    });
  }

  return apiSuccess(result.data, {
    headers: {
      "X-RateLimit-Limit": String(limit.limit),
      "X-RateLimit-Remaining": String(limit.remaining),
      "X-Case-Source": result.data.source,
    },
  });
}
