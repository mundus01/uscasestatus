#!/usr/bin/env node
/**
 * Refresh data/processing-times.json from USCIS historic processing times.
 *
 * Official page: https://egov.uscis.gov/processing-times/historic-pt
 *
 * The historic-pt UI is a Cloudflare-protected Next.js app. Fiscal-year median
 * rows are embedded as JSON.parse([...]) payloads inside a JS chunk (not a
 * stable public CSV). Live fetches from datacenter IPs usually get blocked, so
 * the durable workflow is:
 *
 *   1. Open historic-pt in a browser (or reuse data/uscis-historic-pt.raw.json)
 *   2. Optionally save the page's *_next/static/chunks/*.js bundle that contains
 *      FORM_NUMBER / FY2026 fields, then:
 *        node scripts/update-processing-times.mjs --chunk path/to/chunk.js
 *   3. Or transform the checked-in raw extract:
 *        npm run update:processing-times
 *
 * Outputs:
 *   - data/uscis-historic-pt.raw.json (when fetching/parsing a chunk)
 *   - data/processing-times.json (app consumer file)
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RAW_PATH = join(ROOT, "data/uscis-historic-pt.raw.json");
const OUT_PATH = join(ROOT, "data/processing-times.json");
const SOURCE_URL = "https://egov.uscis.gov/processing-times/historic-pt";
const SOURCE_URL_LEGACY = "https://egov.uscis.gov/processing-times/historic-pt-2";

/** Preferred classification per form code (first regex match wins). */
const PREFERRED_CLASSIFICATION = {
  "I-90": [/replacement or renewal/i, /Initial issuance/i],
  "I-129": [/non Premium filed/i],
  "I-129F": [/All Classifications/i],
  "I-130": [/^Immediate Relative$/i, /Immediate and Preference/i],
  "I-131": [/Advance Parole/i],
  "I-140": [/non Premium filed/i],
  "I-360": [/All Classifications/i],
  "I-485": [/Family-based adjustment/i],
  "I-539": [/All Extend/i],
  "I-751": [/Removal of conditions on lawful permanent resident status \(spouses/i],
  "I-765": [/^All other applications for employment authorization/i],
  "I-821": [/Temporary Protected Status|TPS/i],
  "I-821D": [/Renewal of Deferred Action/i],
  "N-400": [/All Other Application for Naturalization/i],
  "N-600": [/recognition of U\.S\. citizenship/i],
};

const TRACKED_FORMS = Object.keys(PREFERRED_CLASSIFICATION);

/** Recent FY window used to derive a low/high band from official medians. */
const RECENT_FY_COUNT = 3;

function parseArgs(argv) {
  const args = { chunk: null, fromRaw: true, tryFetch: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--chunk") args.chunk = argv[++i];
    else if (a === "--try-fetch") args.tryFetch = true;
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function normalizeFormCode(name) {
  if (!name) return null;
  // Strip footnote markers: "I-130 1", "I-485 3", "Waivers 10", "I-526 6 (Legacy)"
  const cleaned = String(name)
    .replace(/\s*\(Legacy\)\s*/i, "")
    .replace(/\s+\d+\s*$/g, "")
    .replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+/g, "")
    .trim();
  if (/^waivers$/i.test(cleaned)) return "Waivers";
  return cleaned;
}

function parseMonths(value) {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const s = String(value).trim();
  if (!s || /^n\/?a$/i.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function extractArraysFromChunk(text) {
  const starts = [];
  let from = 0;
  while (starts.length < 8) {
    const pos = text.indexOf("FORM_NUMBER", from);
    if (pos < 0) break;
    const parsePos = text.lastIndexOf("JSON.parse(", pos);
    if (parsePos >= 0 && pos - parsePos < 40) starts.push(parsePos);
    from = pos + "FORM_NUMBER".length;
  }
  const uniq = [...new Set(starts)];

  function extractAt(start) {
    const quoteStart = start + "JSON.parse(".length;
    const quoteChar = text[quoteStart];
    if (quoteChar !== "'" && quoteChar !== '"') {
      throw new Error(`Unexpected quote at ${quoteStart}`);
    }
    let i = quoteStart + 1;
    let out = "";
    while (i < text.length) {
      const ch = text[i];
      if (ch === "\\") {
        out += text[i + 1];
        i += 2;
        continue;
      }
      if (ch === quoteChar) break;
      out += ch;
      i++;
    }
    return JSON.parse(out);
  }

  return uniq.map((s) => extractAt(s));
}

function pageLabelForYears(years) {
  const nums = years
    .map((y) => Number(String(y).replace(/^FY/, "")))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  if (!nums.length) return "unknown";
  return `FY${nums[0]}-FY${nums[nums.length - 1]}`;
}

function buildRawFromArrays(arrays, meta = {}) {
  return {
    sourceUrl: SOURCE_URL,
    sourceUrlLegacyPage: SOURCE_URL_LEGACY,
    extractedAt: new Date().toISOString().slice(0, 10),
    chunkNote:
      meta.chunkNote ??
      "Embedded JSON.parse arrays from USCIS Next.js historic-pt page bundle",
    pages: arrays.map((rows) => {
      const years = Object.keys(rows[0] || {}).filter((k) => k.startsWith("FY"));
      return {
        label: pageLabelForYears(years),
        years,
        rows,
      };
    }),
  };
}

function mergeRowsByForm(raw) {
  /** @type {Map<string, Array<{classification: string, titleEn: string, titleEs: string, byFiscalYear: Record<string, number>}>>} */
  const byForm = new Map();

  for (const page of raw.pages || []) {
    for (const row of page.rows || []) {
      const form = normalizeFormCode(row.FORM_NAME);
      if (!form) continue;
      const classification = String(row.FORM_DESC_EN || "").trim();
      const byFiscalYear = {};
      for (const [key, value] of Object.entries(row)) {
        if (!key.startsWith("FY")) continue;
        const year = key.replace(/^FY/, "");
        const months = parseMonths(value);
        if (months != null) byFiscalYear[year] = months;
      }
      if (!Object.keys(byFiscalYear).length) continue;

      const list = byForm.get(form) ?? [];
      const existing = list.find((c) => c.classification === classification);
      if (existing) {
        existing.byFiscalYear = { ...existing.byFiscalYear, ...byFiscalYear };
      } else {
        list.push({
          classification,
          titleEn: String(row.FORM_TITLE_EN || ""),
          titleEs: String(row.FORM_TITLE_ES || ""),
          byFiscalYear,
        });
      }
      byForm.set(form, list);
    }
  }
  return byForm;
}

function pickClassification(form, classifications) {
  const patterns = PREFERRED_CLASSIFICATION[form];
  if (patterns) {
    for (const re of patterns) {
      const hit = classifications.find((c) => re.test(c.classification));
      if (hit) return hit;
    }
  }
  // Fallback: classification with the newest FY median available
  return [...classifications].sort((a, b) => {
    const aMax = Math.max(...Object.keys(a.byFiscalYear).map(Number));
    const bMax = Math.max(...Object.keys(b.byFiscalYear).map(Number));
    return bMax - aMax;
  })[0];
}

function recentBand(byFiscalYear) {
  const years = Object.keys(byFiscalYear)
    .map(Number)
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => b - a);
  const recent = years.slice(0, RECENT_FY_COUNT);
  const values = recent
    .map((y) => byFiscalYear[String(y)])
    .filter((v) => typeof v === "number");
  if (!values.length) return null;
  const latestYear = String(recent[0]);
  const latestMedianMonths = byFiscalYear[latestYear];
  const lowMonths = Math.min(...values);
  const highMonths = Math.max(...values);
  return {
    latestFiscalYear: latestYear,
    latestMedianMonths,
    lowMonths,
    highMonths,
    recentFiscalYears: recent.map(String),
  };
}

function buildProcessingTimes(raw) {
  const merged = mergeRowsByForm(raw);
  /** @type {Record<string, unknown>} */
  const forms = {};

  for (const form of TRACKED_FORMS) {
    const classifications = merged.get(form);
    if (!classifications?.length) continue;
    const preferred = pickClassification(form, classifications);
    const band = recentBand(preferred.byFiscalYear);
    if (!band) continue;

    forms[form] = {
      classification: preferred.classification,
      titleEn: preferred.titleEn,
      titleEs: preferred.titleEs,
      latestFiscalYear: band.latestFiscalYear,
      latestMedianMonths: band.latestMedianMonths,
      // Band derived only from official FY medians (min/max of recent years).
      default: {
        lowMonths: band.lowMonths,
        highMonths: band.highMonths,
      },
      // Historic-pt is national (all offices). No office-level series exists there.
      centers: {},
      byFiscalYear: preferred.byFiscalYear,
      classifications: classifications.map((c) => ({
        classification: c.classification,
        byFiscalYear: c.byFiscalYear,
      })),
    };
  }

  return {
    _meta: {
      source: SOURCE_URL,
      sourceLabel: "USCIS historic processing times",
      methodology:
        "National median months from egov.uscis.gov/processing-times/historic-pt. UI range is min–max of the latest 3 available fiscal-year medians for the preferred form classification. Not comparable to current case-processing-time cycle estimates.",
      coverageNote: "FY2026 values are partial-year through May 31, 2026 per USCIS footnotes.",
      updated: raw.extractedAt ?? new Date().toISOString().slice(0, 10),
      recentFiscalYearWindow: RECENT_FY_COUNT,
    },
    forms,
  };
}

async function tryFetchFromUscis() {
  const ua =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
  const pageRes = await fetch(SOURCE_URL, {
    headers: { "User-Agent": ua, Accept: "text/html" },
  });
  const html = await pageRes.text();
  if (!pageRes.ok || /you have been blocked|Just a moment/i.test(html)) {
    throw new Error(
      `Live fetch blocked or failed (HTTP ${pageRes.status}). Use the checked-in raw file or --chunk.`,
    );
  }
  const chunkPaths = [
    ...html.matchAll(/\/processing-times\/_next\/static\/chunks\/[^"'\\s]+\.js/g),
  ].map((m) => m[0]);
  const unique = [...new Set(chunkPaths)];
  for (const path of unique) {
    const url = new URL(path, "https://egov.uscis.gov").toString();
    const chunkRes = await fetch(url, { headers: { "User-Agent": ua } });
    if (!chunkRes.ok) continue;
    const text = await chunkRes.text();
    if (!text.includes("FORM_NUMBER")) continue;
    const arrays = extractArraysFromChunk(text);
    if (arrays.length >= 1) {
      return buildRawFromArrays(arrays, {
        chunkNote: `Fetched from ${url}`,
      });
    }
  }
  throw new Error("Page loaded but no historic FORM_NUMBER JSON payload found in chunks.");
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`Usage:
  npm run update:processing-times
  node scripts/update-processing-times.mjs [--chunk file.js] [--try-fetch]

Transforms USCIS historic-pt medians into data/processing-times.json.
`);
    process.exit(0);
  }

  (async () => {
    let raw = null;

    if (args.chunk) {
      const text = readFileSync(args.chunk, "utf8");
      const arrays = extractArraysFromChunk(text);
      if (!arrays.length) {
        throw new Error(`No FORM_NUMBER JSON.parse arrays found in ${args.chunk}`);
      }
      raw = buildRawFromArrays(arrays, { chunkNote: `Parsed from ${args.chunk}` });
      writeFileSync(RAW_PATH, JSON.stringify(raw, null, 2) + "\n");
      console.log(`Wrote raw extract → ${RAW_PATH}`);
    } else if (args.tryFetch) {
      raw = await tryFetchFromUscis();
      writeFileSync(RAW_PATH, JSON.stringify(raw, null, 2) + "\n");
      console.log(`Wrote raw extract → ${RAW_PATH}`);
    } else if (existsSync(RAW_PATH)) {
      raw = JSON.parse(readFileSync(RAW_PATH, "utf8"));
      console.log(`Using checked-in raw extract → ${RAW_PATH}`);
    } else {
      throw new Error(
        `Missing ${RAW_PATH}. Provide --chunk, --try-fetch, or commit a raw extract first.`,
      );
    }

    const out = buildProcessingTimes(raw);
    writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n");
    const formCount = Object.keys(out.forms).length;
    console.log(
      `Wrote ${OUT_PATH} (${formCount} tracked forms). Source: ${SOURCE_URL}`,
    );
    for (const [code, form] of Object.entries(out.forms)) {
      console.log(
        `  ${code}: FY${form.latestFiscalYear} median ${form.latestMedianMonths} mo; band ${form.default.lowMonths}–${form.default.highMonths} (${form.classification})`,
      );
    }
  })().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}

main();
