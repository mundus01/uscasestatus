# Case page spec (single-case result)

> Source: product spec received 2026-07-27.  
> **§16 (Accessibility) is the final section** — there is no §17–§20.

## Product decisions (overrides)

| Topic | Decision |
|---|---|
| Neighbor sampling | **Keep** — do not disable cron (`/api/cron/neighbors`) or nearby UI |
| Spec privacy line forbidding neighborhood scan | **Overridden** — neighbors remain part of the product |
| Spec sections | Ends at **§16 Accessibility** — ignore any §17–§20 PR checklists |
| ORM | Keep Supabase SQL migrations + JS client (not migrating to Drizzle in this pass) |

## P0 defects (§1)

1. Elapsed time accrues past decision (§11.2)
2. Progress bar has no range legend / overflow (§11.2–11.3)
3. Timeline is static/generic (§10)
4. Freshness unverifiable (§9.4)
5. Incomplete per-component state matrix (§14)

## Build order (derived; no §20 in source)

1. ~~Taxonomy + state machine (§6)~~
2. ~~Elapsed-time fix + regression test (§11.2)~~
3. ~~ProcessingContext rebuild (§11.3–11.4)~~
4. ~~FreshnessIndicator + refresh (§9.4)~~
5. ~~CaseTimeline rebuild (§10)~~
6. ~~AnswerBand + page reorder (§8–§9.1)~~
7. ~~WhatToDoNext state-driven (§9.3)~~
8. ~~CaseActions + SourcesAndDisclaimer~~
9. ~~Methodology page; GET/POST case APIs + Zod~~
10. P2 deferred: deadlines, forecast/cohort n≥30, share links, print CSS
