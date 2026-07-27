/** Normalizes "I-765" / "Form I-765" / "I765" → "I-765". */
export function normalizeFormType(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.toUpperCase().match(/([A-Z])-?(\d+[A-Z]?)/);
  if (!match) return value.trim() || null;
  return `${match[1]}-${match[2]}`;
}
