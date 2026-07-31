# Placeholder worksheet

**38 values to fill, across 50 places in the pages.** Every one is tokenized as `{{KEY}}` and highlighted amber in the HTML.

**How to use this:** fill in `placeholder-values.json`, then run `python3 fill-placeholders.py`. Filled values lose the amber highlight automatically; anything you leave as `null` stays highlighted so you can see what's outstanding. Output goes to `./filled/` — add `--in-place` to overwrite the originals instead.

Six passages need *drafting* rather than substitution. They're listed at the bottom.

---

## 1. Company identity — 5 values

| Key | Appears in | What's needed |
|---|---|---|
| `ENTITY_NAME` | Terms §Agreement | Bare legal name. e.g. `Acme Labs, Inc.` |
| `ENTITY_FULL` | Privacy §Who we are | Name + jurisdiction + type. e.g. `Acme Labs, Inc., a Delaware corporation` |
| `ENTITY_ADDRESS` | Privacy §Who we are; Accessibility §Feedback | Registered business address |
| `ENTITY_NAME_ADDRESS` | Privacy §Contact; Terms §Contact | Name and address on one line, for the contact blocks |
| `GOVERNING_STATE` | Terms §Governing law | State whose law governs. Usually your state of incorporation or principal place of business — **confirm with counsel**, since consumer-protection law in the user's home state may override it anyway. |

> **Note.** Some founders use a personal address here. For a service whose users are immigrants worried about surveillance, a registered agent address or a business mailbox is worth the small cost.

## 2. Contact points — 6 values

| Key | Appears in | What's needed |
|---|---|---|
| `EMAIL_PRIVACY` | Privacy ×5, Do-not-sell ×2 | Privacy requests inbox. Pre-filled `privacy@uscasestatus.com` — change if different. **Must be monitored**; the pages promise a 10-business-day acknowledgment. |
| `EMAIL_SECURITY` | Terms ×2 | Security reports and account compromise. Pre-filled. |
| `EMAIL_LEGAL` | Terms ×2 | Legal notices and pre-dispute contact. Pre-filled. |
| `EMAIL_A11Y` | Accessibility ×2 | Accessibility reports. Pre-filled. |
| `PHONE_TOLLFREE` | Do-not-sell §Submit a request | Toll-free privacy line. **CCPA requires one only if you operate offline** — if you're web-only, this likely doesn't apply. If it doesn't, tell me and I'll remove the sentence rather than you inventing a number. |
| `DPO_CONTACT` | Privacy §Contact | Name or role of the person accountable for privacy. A role title (`Head of Engineering`) is fine and ages better than a name. |

> All four addresses can be aliases to one inbox. Separating them is about signalling that the right thing happens to each, not about staffing four teams.

## 3. Vendors — 5 values

Named in the Privacy §Who we share it with table. **Name the actual company, not a category** — the checklist item is specifically about naming entities.

| Key | Suggested format | Common answers |
|---|---|---|
| `VENDOR_HOSTING` | `Amazon Web Services, Inc. (US regions)` | AWS, Google Cloud, Vercel, Fly.io, Railway |
| `VENDOR_EMAIL` | `Postmark (ActiveCampaign, LLC)` | Postmark, Resend, SendGrid, Amazon SES |
| `VENDOR_ERRORS` | `Sentry (Functional Software, Inc.)` | Sentry, Rollbar, Bugsnag, or "none" |
| `VENDOR_ANALYTICS` | `Plausible Analytics B.V.` | Plausible, Fathom, Simple Analytics, or "none" |
| `VENDOR_PAYMENTS` | `Stripe, Inc.` | Stripe, Paddle. Write `not applicable` if you take no payments. |

> **Two things to verify before publishing.** The draft says your analytics tool sets no cookies and stores no IP addresses — true of Plausible and Fathom, **not** true of Google Analytics. And it says error monitoring is "configured to scrub personal fields before transmission," which is a setting you have to actually turn on in Sentry.
>
> If you use no analytics and no error monitoring at all, say so — I'll cut those rows, and "we use four vendors" is a stronger claim than a longer table.

## 4. URLs — 5 values

| Key | Appears in | What it points to |
|---|---|---|
| `TRANSPARENCY_REPORT_URL` | Privacy §Government requests | Semi-annual report of government data requests. The page commits you to publishing this. |
| `BREACH_REPORT_URL` | Privacy §If there is a breach | Where post-incident reports go. Can be your blog. |
| `CHANGELOG_URL` | Privacy §Changes | Running log of policy changes with plain-language summaries |
| `POLICY_ARCHIVE_URL` | Privacy §Changes | Where previous versions of the privacy policy live |
| `TERMS_ARCHIVE_URL` | Terms §Changes | Same, for terms |

> Simplest workable setup: one page, `/legal/changelog`, that holds the change log and links to archived versions, plus `/legal/transparency` for the government-request report. Two URLs covering all five, since a changelog can host breach reports too.
>
> **The transparency report is a real commitment.** Even at zero requests, publishing "0 requests received, July–December 2026" twice a year matters — a report that stops appearing is itself a signal, which is why these are valuable to your users.

## 5. Policy decisions — 3 values

| Key | Appears in | Decision |
|---|---|---|
| `MIN_CELL_SIZE` | Privacy §Aggregate data | Minimum cases in a block before you publish a statistic. Default `25`. Talk to whoever owns the data pipeline: too low leaks individuals, too high hides your product from users in small blocks. **The site must actually enforce whatever number you write.** |
| `TRANSFER_MECHANISM` | Privacy §Users outside the U.S. | How you lawfully receive EU/UK data. Usually `Standard Contractual Clauses`. If you have no EU users and don't market there, say so and I'll simplify the section. |
| `LIABILITY_CAP` | Terms §Limitation of liability | Cap on your total liability. Default draft is `ONE HUNDRED U.S. DOLLARS ($100)`. **Counsel decision** — for a free service $100 is defensible, but caps can be unenforceable against statutory privacy claims in some states. |

## 6. Accessibility — 7 values

| Key | What's needed |
|---|---|
| `A11Y_AUDITOR` | Who did the audit — `our engineering team` or a named firm. Be honest; self-audit is fine to disclose. |
| `A11Y_LAST_AUDIT` | Date of the audit |
| `A11Y_NEXT_AUDIT` | Next scheduled audit |
| `A11Y_LAST_REVIEW` | When the statement itself was last reviewed |
| `A11Y_FIX_DUE_1/2/3` | Target dates for the three known limitations listed |

> **Don't fill these until the audit has actually happened.** The page claims "partially conformant with WCAG 2.2 AA" alongside an audit date — an unverified conformance claim with a date attached is the kind of statement that draws demand letters. Run the audit first (axe DevTools and a manual keyboard pass will find most of it), then adjust both the known-limitations table and these dates to match reality.

## 7. CCPA request metrics — 7 values

| Key | What's needed |
|---|---|
| `METRICS_YEAR` | Calendar year the figures cover |
| `M_KNOW` / `M_DELETE` / `M_CORRECT` / `M_OPTOUT` | Requests received in each category |
| `M_DENIED` | Requests denied |
| `M_MEDIAN_DAYS` | Median days to substantive response |

> **This table is mandatory only for businesses handling personal information of 10 million+ California residents.** You're almost certainly below that. If so, either publish it voluntarily — zeros in year one are a fine look — or tell me and I'll remove the section. Don't leave it half-filled.

---

## Passages that need drafting, not substitution

These six can't be filled from a table. Four are verification tasks; two need written content.

| Page | What's needed |
|---|---|
| **Terms §Fees** | Pricing, billing cycle, renewal, and refund terms — **only if** you have paid tiers. If everything is free, tell me and I'll cut the placeholder and keep the "we will never paywall your own case" sentence, which is stronger alone. |
| **Terms §Disputes** | ❗ **Counsel decision, deliberately left blank.** Arbitration clause or court? If arbitration: plain-language explanation, 30-day opt-out, small-claims carve-out. My note in the draft argues against a class-action waiver on statutory privacy claims for this user base — worth discussing rather than accepting a template. |
| **Terms §Other terms** | Which language controls if the English and Spanish versions conflict. Usually English, but say it explicitly. |
| **Cookies §Full cookie list** | ⚠️ **Verify the table against what the app actually sets.** It currently claims five first-party cookies and zero third parties. Open DevTools → Application → Cookies and check. If it's wrong, that's a misrepresentation regulators treat differently from a typo. |
| **Accessibility §Tested with** | ⚠️ Confirm the assistive-technology list matches testing you actually performed. Cut anything you haven't tested. |
| **Do-not-sell §Submit a request** | ⚠️ Confirm whether the toll-free number requirement applies. If web-only, the sentence comes out. |

---

## Suggested order

1. **Company identity and emails** — 11 values, 20 minutes, unblocks most of the text.
2. **Vendors** — check your actual bills rather than what you remember installing.
3. **Verify the cookie table** — the one item where being wrong is worse than being blank.
4. **URLs** — decide the two-page structure, then fill.
5. **Counsel review** — disputes clause, liability cap, governing law, CCPA applicability.
6. **Accessibility audit**, then fill those seven.
7. **Run the script**, review the output, publish.

*Not legal advice. Counsel review required before publication.*
