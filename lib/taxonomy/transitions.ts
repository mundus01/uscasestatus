import { getStatusDef } from "@/lib/taxonomy/normalize";
import type { StatusCode } from "@/lib/taxonomy/types";

export function isTransitionAllowed(from: StatusCode, to: StatusCode): boolean {
  if (from === to) return true;
  if (to === "UNKNOWN" || from === "UNKNOWN") return true;
  const def = getStatusDef(from);
  return def.allowedNext.includes(to);
}

/**
 * Forecast / "what's next in processing" is forbidden for terminal cases.
 */
export function assertRenderableForecast(input: {
  isTerminal: boolean;
}): void {
  if (input.isTerminal) {
    throw new Error("Forecast is not renderable for terminal cases");
  }
}

export function canRenderForecast(isTerminal: boolean): boolean {
  return !isTerminal;
}
