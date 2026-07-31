import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

/**
 * Header that next-intl attaches to the rewritten request when it resolves a
 * locale. Its presence means we are seeing our own rewrite come back around.
 */
const INTL_LOCALE_HEADER = "x-next-intl-locale";

/**
 * Next.js 16 renamed the `middleware` convention to `proxy`.
 *
 * Unlike Next 15 middleware, Next 16 runs the proxy again on the path a rewrite
 * points at. Because English is served unprefixed, next-intl rewrites `/` to
 * `/en`, and on the second pass it would redirect `/en` back to `/` — an
 * infinite loop. Passing the internal pass straight through avoids it.
 */
export function proxy(request: NextRequest) {
  if (request.headers.has(INTL_LOCALE_HEADER)) {
    return NextResponse.next();
  }

  return handleI18nRouting(request);
}

export const config = {
  // Skip Next internals, API routes, generated icons, and anything with a
  // file extension. Icon routes have no extension (`/icon`, `/apple-icon`) so
  // they must be listed explicitly or i18n rewrites them to `/en/icon` → 404.
  matcher: ["/((?!api|_next|_vercel|icon|apple-icon|.*\\..*).*)"],
};
