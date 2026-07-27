import explanationsData from "@/data/status-explanations.json";

import type { Locale } from "@/i18n/routing";
import type { StatusTone } from "@/lib/status";
import type { StatusExplanation, TimelineStepId } from "@/lib/uscis/types";

const explanations = explanationsData as StatusExplanation[];

const byExactMatch = new Map<string, StatusExplanation>();

for (const explanation of explanations) {
  for (const title of explanation.match) {
    byExactMatch.set(normalizeStatusKey(title), explanation);
  }
}

const unknown =
  explanations.find((item) => item.slug === "unknown") ?? explanations[0];

export function normalizeStatusKey(statusText: string): string {
  return statusText
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function statusSlugFromText(statusText: string): string {
  return normalizeStatusKey(statusText).replace(/\s+/g, "_");
}

export function findExplanation(statusText: string): StatusExplanation {
  const key = normalizeStatusKey(statusText);
  const exact = byExactMatch.get(key);
  if (exact) return exact;

  // Fuzzy: prefer the longest match title contained in the status text.
  let best: StatusExplanation | null = null;
  let bestLength = 0;

  for (const explanation of explanations) {
    if (explanation.slug === "unknown") continue;
    for (const title of explanation.match) {
      const titleKey = normalizeStatusKey(title);
      if (key.includes(titleKey) && titleKey.length > bestLength) {
        best = explanation;
        bestLength = titleKey.length;
      }
    }
  }

  return best ?? unknown;
}

export function getExplanationCopy(
  explanation: StatusExplanation,
  locale: Locale,
): { plainEnglish: string; whatToDo: string; tone: StatusTone } {
  return {
    plainEnglish: explanation.plainEnglish[locale],
    whatToDo: explanation.whatToDo[locale],
    tone: explanation.tone,
  };
}

export function getTimelineStepForStatus(statusText: string): TimelineStepId {
  return findExplanation(statusText).timelineStep;
}

/** All expert explanations except the unknown fallback — for SEO pages. */
export function listExplanations(): StatusExplanation[] {
  return explanations.filter((item) => item.slug !== "unknown");
}

export function getExplanationBySlug(slug: string): StatusExplanation | undefined {
  return explanations.find((item) => item.slug === slug);
}
