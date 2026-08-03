/**
 * Privacy floor for published corpus statistics.
 * Matches Terms/placeholder-values.json MIN_CELL_SIZE — do not publish
 * aggregates derived from fewer cases.
 */
export const MIN_CELL_SIZE = 25;

/** True when a sample is large enough to show block-level stats. */
export function isSufficientSample(sampleSize: number): boolean {
  return Number.isFinite(sampleSize) && sampleSize >= MIN_CELL_SIZE;
}
