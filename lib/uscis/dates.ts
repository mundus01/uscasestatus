/** Parses USCIS dates like "09-05-2023 14:28:46" or "09-05-2023". */
export function parseUscisDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = value.trim().match(
    /^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+(\d{1,2}):(\d{2}):(\d{2}))?$/,
  );
  if (!match) return null;

  const month = Number(match[1]) - 1;
  const day = Number(match[2]);
  const year = Number(match[3]);
  const hour = Number(match[4] ?? 0);
  const minute = Number(match[5] ?? 0);
  const second = Number(match[6] ?? 0);

  const date = new Date(Date.UTC(year, month, day, hour, minute, second));
  return Number.isNaN(date.getTime()) ? null : date;
}
