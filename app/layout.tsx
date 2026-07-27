import type { Metadata } from "next";
import type { ReactNode } from "react";

import { publicEnv } from "@/lib/env";

/**
 * Root layout required for app-level metadata routes (OG image, robots, sitemap).
 * The visible chrome (html/body, fonts, header) lives in `app/[locale]/layout.tsx`.
 */
export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
