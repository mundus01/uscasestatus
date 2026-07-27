/**
 * Best-effort filing date from a classic paper-receipt number.
 *
 * Format after the 3-letter prefix is often: YY DDD #####
 * where YY is the federal fiscal year and DDD is the Julian day within that
 * fiscal year (Oct 1 → Sep 30). IOE (online) numbers do not reliably encode
 * this, so we return null for those rather than guessing.
 */

export function estimateFilingDateFromReceipt(receipt: string): Date | null {
  const normalized = receipt.toUpperCase();
  if (!/^[A-Z]{3}\d{10}$/.test(normalized)) return null;

  const prefix = normalized.slice(0, 3);
  if (prefix === "IOE") return null;

  const yy = Number(normalized.slice(3, 5));
  const ddd = Number(normalized.slice(5, 8));
  if (!Number.isFinite(yy) || !Number.isFinite(ddd) || ddd < 1 || ddd > 366) {
    return null;
  }

  // Fiscal year YY starts Oct 1 of calendar year (2000+YY-1).
  const fiscalYear = 2000 + yy;
  const fiscalStart = new Date(Date.UTC(fiscalYear - 1, 9, 1));
  const filed = new Date(fiscalStart);
  filed.setUTCDate(fiscalStart.getUTCDate() + (ddd - 1));

  // Sanity: reject dates more than a year in the future or before 1990.
  const now = Date.now();
  if (filed.getTime() > now + 366 * 24 * 60 * 60 * 1000) return null;
  if (filed.getUTCFullYear() < 1990) return null;

  return filed;
}

/** Anonymized receipt block: prefix + fiscal year/day digits (no serial). */
export function receiptBlock(receipt: string): string {
  return receipt.toUpperCase().slice(0, 8);
}
