# USCIS historic processing times

All in-product “published processing time” ranges come from the official USCIS
historic processing times page:

https://egov.uscis.gov/processing-times/historic-pt

## What the official site exposes

| Surface | Notes |
| --- | --- |
| HTML UI | Next.js app behind Cloudflare bot protection. Two paginated tables: FY2021–FY2026 and FY2014–FY2019. |
| Embedded JSON | Fiscal-year median rows are shipped inside a `_next/static/chunks/*.js` bundle as `JSON.parse('[{"FORM_NUMBER":...}]')` arrays (fields like `FORM_NAME`, `FORM_DESC_EN`, `FY2021`…`FY2026`). |
| Legacy `/processing-times/api/*` | Former JSON API for *current* office-level cycle times. Server-side requests are typically Cloudflare-blocked; historic-pt does not use a stable public CSV. |
| Factsheet PDF | Older select-form medians also appear in USCIS factsheets under Immigration and Citizenship Data (same national-median concept, fewer forms). |

Important: historic medians are **national** (all offices) and use a different
methodology than the live “Check Case Processing Times” tool. USCIS says they
are not comparable.

## Repo files

| File | Role |
| --- | --- |
| `data/uscis-historic-pt.raw.json` | Checked-in extract of the official embedded JSON arrays |
| `data/processing-times.json` | App-facing file (preferred classification + recent FY band) |
| `scripts/update-processing-times.mjs` | Transform / refresh script |
| `lib/processing-times.ts` | Readers used by case / forms / processing-times pages |

## How UI numbers are derived

For each tracked form we pick a preferred classification (for example I-130
Immediate Relative, I-129 non-premium, I-765 “all other”). The displayed
`lowMonths`–`highMonths` band is the **min and max of the latest three available
fiscal-year medians** for that classification — not invented office guesses.

FY2026 on the official page is partial-year (through May 31, 2026).

## Refresh

```bash
# Transform the checked-in raw extract (default, no network)
npm run update:processing-times

# If you downloaded a historic-pt JS chunk that contains FORM_NUMBER payloads:
node scripts/update-processing-times.mjs --chunk ./path/to/chunk.js

# Attempt a live fetch (usually Cloudflare-blocked from servers/CI):
node scripts/update-processing-times.mjs --try-fetch
```

Commit both `data/uscis-historic-pt.raw.json` and `data/processing-times.json`
when the official tables change.

## Consumers

- Case page estimate card (“how this compares to published times”)
- `/processing-times` hub + `/processing-times/[form]`
- `/forms/[trackerSlug]` tracker pages
- Case API `publishedRange` via `getProcessingTimeContext`

Homepage marketing copy may mention processing times in general; it does not
read these product numbers.

## Limitations

- No service-center breakdown on historic-pt (centers map is empty).
- Multi-classification forms use one preferred class for the case UI; other
  classes remain in `classifications` for transparency.
- Wide bands can appear when recent FY medians swing (e.g. I-90 backlog clear-out).
- Live Vercel cron scraping is fragile because of Cloudflare; prefer the npm script + committed JSON.
