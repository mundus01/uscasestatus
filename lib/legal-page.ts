import { readFile } from "fs/promises";
import path from "path";

const FILES = {
  privacy: "privacy.html",
  terms: "terms.html",
  cookies: "cookies.html",
  accessibility: "accessibility.html",
  "do-not-sell": "do-not-sell.html",
} as const;

export type LegalPage = keyof typeof FILES;

/** Serve a filled legal HTML document outside the locale layout. */
export async function legalPageResponse(page: LegalPage): Promise<Response> {
  const filePath = path.join(process.cwd(), "public", FILES[page]);
  const html = await readFile(filePath, "utf8");
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}
