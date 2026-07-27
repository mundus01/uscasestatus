/**
 * USCIS receipt numbers are 13 characters: a 3-letter office prefix followed by
 * 10 digits (e.g. IOE0912345678).
 */

export const RECEIPT_LENGTH = 13;

export const RECEIPT_PREFIXES = [
  "IOE",
  "WAC",
  "EAC",
  "LIN",
  "SRC",
  "YSC",
  "ZAR",
  "ZCH",
  "ZHN",
  "NBC",
  "MSC",
  "MGL",
  "MCT",
] as const;

export type ReceiptPrefix = (typeof RECEIPT_PREFIXES)[number];

/**
 * Names for the prefixes USCIS documents publicly. Prefixes we cannot name with
 * confidence are intentionally absent rather than guessed — a wrong service
 * center is worse than none.
 */
const SERVICE_CENTER_NAMES: Partial<Record<ReceiptPrefix, string>> = {
  IOE: "USCIS online filing (ELIS)",
  WAC: "California Service Center",
  EAC: "Vermont Service Center",
  LIN: "Nebraska Service Center",
  SRC: "Texas Service Center",
  YSC: "Potomac Service Center",
  NBC: "National Benefits Center",
  MSC: "National Benefits Center",
};

export type ReceiptErrorCode =
  | "empty"
  | "tooShort"
  | "tooLong"
  | "badPrefix"
  | "badFormat";

export type ReceiptValidation =
  | { ok: true; receipt: string; prefix: ReceiptPrefix }
  | { ok: false; code: ReceiptErrorCode; length: number; prefix?: string };

/** Uppercases and strips everything that can't appear in a receipt number. */
export function normalizeReceipt(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isReceiptPrefix(value: string): value is ReceiptPrefix {
  return (RECEIPT_PREFIXES as readonly string[]).includes(value);
}

export function validateReceipt(input: string): ReceiptValidation {
  const receipt = normalizeReceipt(input);

  if (receipt.length === 0) {
    return { ok: false, code: "empty", length: 0 };
  }

  const prefix = receipt.slice(0, 3);

  // Flag a wrong prefix as soon as three letters are present, so the user is
  // corrected before typing ten more digits.
  if (/^[A-Z]{3}/.test(prefix) && !isReceiptPrefix(prefix)) {
    return { ok: false, code: "badPrefix", length: receipt.length, prefix };
  }

  if (receipt.length < RECEIPT_LENGTH) {
    return { ok: false, code: "tooShort", length: receipt.length };
  }

  if (receipt.length > RECEIPT_LENGTH) {
    return { ok: false, code: "tooLong", length: receipt.length };
  }

  if (!/^[A-Z]{3}\d{10}$/.test(receipt)) {
    return { ok: false, code: "badFormat", length: receipt.length };
  }

  if (!isReceiptPrefix(prefix)) {
    return { ok: false, code: "badPrefix", length: receipt.length, prefix };
  }

  return { ok: true, receipt, prefix };
}

export function isValidReceipt(input: string): boolean {
  return validateReceipt(input).ok;
}

/** Groups a receipt for display: IOE0912345678 -> "IOE 09 012 45678". */
export function formatReceipt(input: string): string {
  const receipt = normalizeReceipt(input);
  if (!/^[A-Z]{3}\d{10}$/.test(receipt)) return receipt;

  const prefix = receipt.slice(0, 3);
  return [
    prefix,
    receipt.slice(3, 5),
    receipt.slice(5, 8),
    receipt.slice(8),
  ].join(" ");
}

export function getServiceCenterName(input: string): string | null {
  const prefix = normalizeReceipt(input).slice(0, 3);
  if (!isReceiptPrefix(prefix)) return null;
  return SERVICE_CENTER_NAMES[prefix] ?? null;
}
