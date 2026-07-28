import { normalizeStatusKey } from "@/lib/explanations";
import { STATUS_BY_CODE, STATUS_DEFS } from "@/lib/taxonomy/codes";
import type { StatusCode, StatusDef } from "@/lib/taxonomy/types";

const byMatcher = new Map<string, StatusDef>();

for (const def of STATUS_DEFS) {
  if (def.code === "UNKNOWN") continue;
  for (const matcher of def.matchers) {
    byMatcher.set(normalizeStatusKey(matcher), def);
  }
}

export function normalizeStatus(rawStatusText: string): StatusDef {
  const key = normalizeStatusKey(rawStatusText);
  const exact = byMatcher.get(key);
  if (exact) return exact;

  let best: StatusDef | null = null;
  let bestLength = 0;
  for (const def of STATUS_DEFS) {
    if (def.code === "UNKNOWN") continue;
    for (const matcher of def.matchers) {
      const matcherKey = normalizeStatusKey(matcher);
      if (key.includes(matcherKey) && matcherKey.length > bestLength) {
        best = def;
        bestLength = matcherKey.length;
      }
    }
  }

  return best ?? STATUS_BY_CODE.UNKNOWN;
}

export function getStatusDef(code: StatusCode): StatusDef {
  return STATUS_BY_CODE[code] ?? STATUS_BY_CODE.UNKNOWN;
}
