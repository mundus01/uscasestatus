/**
 * Every USCIS status is reduced to one of four tones that drive colour across
 * the product. Phase 1 maps raw USCIS messages onto these.
 */
export const STATUS_TONES = ["pending", "approved", "alert", "neutral"] as const;

export type StatusTone = (typeof STATUS_TONES)[number];

export function isStatusTone(value: string): value is StatusTone {
  return (STATUS_TONES as readonly string[]).includes(value);
}
