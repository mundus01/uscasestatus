# Website Fetch Feasibility (Path B)

**Goal:** Decide whether uscasestatus can build a corpus from the **public Case Status Online (CSOL) website path** at a scale that supports analytics — before committing more product build to the “corpus moat.”

**Date started:** 2026-07-27  
**Status:** Spike in progress — Day-0 baseline complete; scale experiment not yet run.

---

## Decision question

Can we sustainably obtain structured USCIS case status for **≥ ~5–10k receipts/day for 7 consecutive days**, with a credible path to **~50k+/day**, without the channel dying?

| Verdict | Criteria |
|---|---|
| **GO on B** | Hit 5–10k successful structured fetches/day × 7 days; error/challenge rate stable; ops cost acceptable |
| **CONDITIONAL** | Works at 1–5k/day but degrades under load, or needs heavy browser/proxy ops |
| **NO-GO on B** | Cannot clear Cloudflare reliably, or success collapses under modest concurrency, or legal/ToS risk is unacceptable |

If B is NO-GO, fall back to Torch (Path A) and/or a non-corpus product bet (explanations + alerts + SEO).

---

## What Day-0 proved (2026-07-27)

### 1. Plain HTTP is blocked

From this environment:

| Request | Result |
|---|---|
| `GET https://egov.uscis.gov/` | **403** Cloudflare interstitial |
| `POST …/casestatus/mycasestatus.do` | **403** Cloudflare |
| `GET …/csol-api/ui-auth` | **403** Cloudflare |
| `GET …/csol-api/case-statuses/{receipt}` | **403** Cloudflare |

**Implication:** There is no “simple curl loop” corpus. Path B requires a **browser-grade client** (or equivalent challenge-capable session), not Node `fetch` alone.

### 2. Real browser path works

In Cursor’s browser against `egov.uscis.gov`:

1. Cloudflare “Just a moment…” challenge appeared, then cleared.
2. UI lookup for `IOE0937093459` returned live status text (I-140 RFE, evidence due language referencing July 8, 2026).
3. Site is a **Next.js** CSOL app (`/_next/static/chunks/…`).

### 3. Response shape matches competitor corpus fields

Frontend chunk handles:

```text
data.CaseStatusResponse.isValid
data.CaseStatusResponse.detailsEng.actionCodeText
data.CaseStatusResponse.detailsEng.actionCodeDesc
data.CaseStatusResponse.detailsEs.actionCodeText
data.CaseStatusResponse.detailsEs.actionCodeDesc
```

That is the same **`actionCodeText` / CSOL-shaped** family TrackMyI140 stores — not Torch’s `current_case_status_text_en`.

Public community scripts (e.g. older gists) document a two-step CSOL JSON flow:

1. `GET /csol-api/ui-auth` → short-lived session JWT  
2. `GET /csol-api/case-statuses/{receipt}` with `Authorization: Bearer …`

We did **not** automate that credentialed JSON path in this spike (approval boundary). Day-0 only confirmed UI success + field names in shipped JS.

### 4. Market proof (external)

- MyCasesHub FAQ: status from the **official USCIS website**
- TrackMyI140: ~670k cases / ~138k updates/day on CSOL-shaped fields

So **B is possible for someone**. Day-0 only proves the door exists; not that *we* can hold it open at scale.

---

## Path B architecture (what “website fetch” actually means)

```text
┌─────────────────────────────────────────────────────────┐
│  Session layer (hard part)                              │
│  Real browser / challenge-capable client                │
│  → pass Cloudflare → obtain CSOL session / JWT          │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Fetch layer (easy once session works)                  │
│  Structured status for receipt N                        │
│  Prefer JSON (csol-api) over HTML DOM parse             │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Corpus layer (product moat)                            │
│  store → neighbor enqueue → recheck cron → analytics    │
└─────────────────────────────────────────────────────────┘
```

**Transport is a plug-in.** Neighbor sampling and analytics do not care whether the transport is CSOL or Torch — only that you get status + form + dates reliably.

### Implementation tiers (cheapest → most ops)

| Tier | Method | Pros | Cons |
|---|---|---|---|
| **B1** | Challenge-capable HTTP session → call CSOL JSON | Fastest QPS if it works | Fragile; CF changes break it |
| **B2** | Headless browser, drive public UI / intercept JSON | Closest to “real user” | Expensive CPU; lower QPS |
| **B3** | Managed browser farm / residential proxies | Scales like competitors | Cost + ToS/abuse optics |

Feasibility order: prove **B2 single-IP baseline**, then try **B1** reuse of session cookies for many JSON calls per challenge, then decide if **B3** is worth it.

---

## 7-day experiment design

Do **not** start neighbor crawling of unverified receipts until Day-0→Day-2 gates pass. Use a small allowlist of known-good receipts (e.g. ones you or testers own / already publicly checked).

### Metrics to log every attempt

- `ts`, `receipt`, `method` (`ui-dom` | `csol-json`)
- `ok` (bool)
- `latency_ms`
- `error_class`: `cf_challenge` | `cf_block` | `timeout` | `invalid` | `not_found` | `parse` | `other`
- `status_text` (if ok) — enough to verify non-empty structured parse
- `session_age_s` (how long since last CF clear)

### Schedule

| Day | Target | What you’re proving |
|---|---|---|
| **0** | Manual / browser: 1–10 lookups | Surface works *(done)* |
| **1** | Automated browser: 100 lookups, 1 IP, ≤1 QPS | Automation survives CF |
| **2** | Same session: N JSON fetches per CF clear | Session reuse multiplier |
| **3** | 1,000 lookups/day | Sustained low volume |
| **4–5** | Ramp toward 5–10k/day | Soft ceiling / ban curve |
| **6–7** | Hold best stable rate 48h | Durability |

### Pass / fail numbers

| Gate | Pass |
|---|---|
| Day 1 | ≥ 90% success on 100 attempts |
| Day 2 | ≥ 20 successful JSON fetches per successful CF session *(stretch; measure actual)* |
| Day 3 | ≥ 1,000 successful / day |
| Day 5 | ≥ 5,000 successful / day without escalating blocks |
| Day 7 | Hold ≥ 5,000/day × 2 days; p95 latency usable; no progressive ban spiral |

If Day 1 fails hard → B is NO-GO without paid browser/proxy infra (B3), which is a different cost model.

---

## Risks (accept before building)

1. **Cloudflare bot management** — primary technical risk; changes without notice.
2. **ToS / acceptable use** — CSOL is a public consumer tool; bulk automated polling may violate USCIS/DHS site terms. Get a legal read before production neighbor crawling.
3. **Ops burden** — session refresh, fingerprinting, IP reputation, on-call when CF tightens.
4. **Ethics / user trust** — corpus from public receipt statuses is industry-standard here, but aggressive probing of sequential receipts should be throttled and privacy-minimized (store status metadata, not PII).
5. **Opportunity cost** — every week on B is a week not shipping alerts/SEO; spike must stay time-boxed.

---

## What we will *not* do in this spike

- No Cloudflare bypass exploits, CAPTCHA-solving services, or attack tooling in-repo.
- No mass neighbor crawl until Day 1–2 gates pass.
- No production wiring into `/api/check` until GO.

---

## Immediate next actions

1. **Scaffold a local Playwright harness** (B2): open CSOL → wait for challenge → submit receipt → parse status from DOM (and optionally capture response URL pattern without logging secrets).
2. **Run Day 1**: 100 lookups, log metrics to `docs/feasibility-runs/day1.jsonl`.
3. **Decide Day 2**: attempt session-reuse JSON only if Day 1 ≥ 90% and you explicitly approve probing `csol-api` with session cookies from that browser context.
4. **Parallel (recommended):** still apply for Torch sandbox — hedge if B fails.

---

## Day-0 conclusion

Path B is **technically real**: Cloudflare-gated, browser-passable, CSOL JSON-shaped (`actionCodeText`), competitor-proven at corpus scale.

Path B is **not yet validated for us at scale**. The blocker is not parsing — it is **durable automated session acquisition** past Cloudflare at thousands of requests/day.

**Next gate:** Day 1 Playwright success rate.
