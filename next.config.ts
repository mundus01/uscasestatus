import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Legal route handlers read these HTML files at request time.
  outputFileTracingIncludes: {
    "/privacy": ["./public/privacy.html"],
    "/terms": ["./public/terms.html"],
    "/cookies": ["./public/cookies.html"],
    "/accessibility": ["./public/accessibility.html"],
    "/do-not-sell": ["./public/do-not-sell.html"],
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
