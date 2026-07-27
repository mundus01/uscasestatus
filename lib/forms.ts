import formsData from "@/data/forms.json";

import type { Locale } from "@/i18n/routing";

export type FormCategory =
  | "green-card"
  | "work-permit"
  | "citizenship"
  | "family"
  | "employment"
  | "travel"
  | "humanitarian"
  | "status-change";

export type LocalizedText = Record<Locale, string>;

export type UscisForm = {
  code: string;
  trackerSlug: string;
  category: FormCategory;
  officialTitle: string;
  commonName: LocalizedText;
  shortDescription: LocalizedText;
  hasBiometrics: boolean;
  hasInterview: boolean;
  producesCard: boolean;
};

export const forms = formsData as UscisForm[];

export function getForm(code: string): UscisForm | undefined {
  const normalized = code.toUpperCase();
  return forms.find((form) => form.code === normalized);
}

export function getFormByTrackerSlug(slug: string): UscisForm | undefined {
  return forms.find((form) => form.trackerSlug === slug);
}

/** URL segment for a form code: I-485 → i-485 */
export function formToPathSlug(code: string): string {
  return code.toLowerCase();
}

export function formFromPathSlug(slug: string): UscisForm | undefined {
  return getForm(slug.toUpperCase());
}
