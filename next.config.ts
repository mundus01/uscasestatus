import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Legal route handlers read these HTML files at request time.
  outputFileTracingIncludes: {
    "/[locale]/privacy": ["./public/privacy.html"],
    "/[locale]/terms": ["./public/terms.html"],
    "/[locale]/cookies": ["./public/cookies.html"],
    "/[locale]/accessibility": ["./public/accessibility.html"],
    "/[locale]/do-not-sell": ["./public/do-not-sell.html"],
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
