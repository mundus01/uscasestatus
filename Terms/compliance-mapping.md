# Compliance mapping — uscasestatus legal pages

Each checklist item below maps to the section that addresses it. Section anchors are live links within the drafted pages.

**Status key:** ✅ addressed · ⚠️ addressed but needs a real value or a business decision · ❗ needs counsel

---

## Data retention and deletion

| Checklist item | Where | Status |
|---|---|---|
| Easy way to request permanent deletion | Privacy §[Deleting your data](privacy.html#delete) — two clicks in Settings, no email required, no retention offer; fallback form on [Do not sell my info](do-not-sell.html#request) | ✅ |
| State how soon deletion happens | Privacy §[Deleting your data](privacy.html#delete) — immediate deactivation, 30 days production erasure, 35 days backups, email confirmation on completion | ✅ |
| CCPA compliance, if applicable | Privacy §[California privacy rights](privacy.html#ccpa) + entire [Do not sell my info](do-not-sell.html) page | ❗ Confirm you meet a CCPA threshold (>$25M revenue, PI of 100k+ consumers, or ≥50% revenue from selling PI). Pages are written to comply regardless. |

## Privacy and data practices

| Checklist item | Where | Status |
|---|---|---|
| Define specific types of data collected | Privacy §[What we collect](privacy.html#collect) — two field-level tables, plus §[What we never collect](privacy.html#not-collect) listing SSN, A-number, passport, biometrics, health, financial, contacts, precise geolocation | ✅ |
| Clearly describe how data will be used, including de-identified/anonymized sharing | Privacy §[How we use it](privacy.html#use) and §[Aggregate and de-identified data](privacy.html#aggregate) | ✅ |
| Name entities data is shared with, and how they use it | Privacy §[Who we share it with](privacy.html#share) — named table with purpose and permitted use per recipient | ⚠️ Vendor names are placeholders |
| State that no data is sold | Privacy §[We do not sell your data](privacy.html#sell); [Do not sell my info](do-not-sell.html#answer) | ✅ |
| Specify whether data is sold for profit or other monetary transactions | Privacy §[We do not sell your data](privacy.html#sell) — explicitly covers "money or anything else of value," plus 12-month lookback statement | ✅ |
| Inform users of data-sharing choices, risks, benefits, limitations | Privacy §[How sharing affects other people](privacy.html#others) — final bullet states benefits, limitations, and risks explicitly; §[Your choices](privacy.html#choices) | ✅ |
| Specify how sharing could impact others | Privacy §[How sharing affects other people](privacy.html#others) — I-130/I-140 petitions concern two or more people; country of birth reveals family national origin; shared mailboxes | ✅ |
| Third-party use/disclosure of user info (incl. de-identified) prohibited without active consent | Privacy §[Conditions we impose on every recipient](privacy.html#share) — bolded prohibition covering de-identified, anonymized, and pseudonymized data; no model training, no dataset combination, no retention after termination | ✅ |
| Third parties bound to the terms of your privacy policy | Privacy §[Conditions we impose on every recipient](privacy.html#share) — first bullet | ⚠️ Requires matching DPA clauses in vendor contracts |
| Breach notification with instructions for user action | Privacy §[If there is a breach](privacy.html#breach) — 72 hours, what/when/scope, specific protective steps including contacting an immigration attorney, regulator notice, public post-incident report | ✅ |
| Data retention policy incl. dormant accounts | Privacy §[How long we keep data](privacy.html#retention) — per-category table + 24-month dormancy with two warning emails then deletion | ✅ |
| Instructions to permanently delete data | Privacy §[Deleting your data](privacy.html#delete) — numbered steps | ✅ |
| What happens to data on transfer of ownership / wind-down | Privacy §[If our ownership changes](privacy.html#ownership) — 30-day advance notice; acquirer must adopt this policy in writing; **and** user gets the choice to export or have data securely destroyed; wind-down destroys all data | ✅ Covers both the "policies align" option and the user-choice option |
| Securely dispose of / transmit / download their information | Privacy §[If our ownership changes](privacy.html#ownership) bullet 3; export also available anytime via §[Your choices](privacy.html#choices) | ✅ |
| How users can close their account | Privacy §[Closing your account](privacy.html#close) — distinguishes closing from deleting | ✅ |
| Notify users of changes in ownership | Privacy §[If our ownership changes](privacy.html#ownership) — email + prominent site notice, ≥30 days ahead | ✅ |
| Active consent when policies change | Privacy §[Changes to this policy](privacy.html#changes); Terms §[Changes to these terms](terms.html#changes) — click-to-agree required, silence ≠ consent, no retroactive application | ✅ |
| Plain-language summaries of what changed | Privacy §[Changes to this policy](privacy.html#changes) — side-by-side before/after summary, not a redline; changelog URL | ⚠️ Needs changelog URL and a build process to produce the summaries |

---

## Additions not on the checklist, included because this product needs them

| Item | Where | Why |
|---|---|---|
| **Government / law enforcement request policy** | Privacy §[Government and law enforcement](privacy.html#government) | The single biggest trust question for this user base. Commits to valid legal process only, narrow disclosure, user notification unless legally barred, and a semi-annual transparency report. No generic checklist covers this, and its absence would be conspicuous. |
| **Immigration status as sensitive PI** | Privacy §[Sensitive information](privacy.html#sensitive) | AB 947 added citizenship/immigration status to CCPA sensitive PI effective Jan 1, 2024. Connecticut, Virginia, Colorado treat it similarly. Directly triggers heightened obligations for your core dataset. |
| **Never asking for identity documents to exercise privacy rights** | [Do not sell my info §How we verify you](do-not-sell.html#verify) | Standard identity-verification flows would require immigrants to upload passports to protect their privacy. Email-link verification only. |
| **k-anonymity floor on published statistics** | Privacy §[Aggregate and de-identified data](privacy.html#aggregate) | Your product publishes block-level stats. Without a minimum cell size, small blocks could expose individuals. Placeholder set at 25 cases. |
| **No trackers, stated as a safety measure** | [Cookies §What we don't use](cookies.html#nothere) | A third-party pixel on a page about someone's immigration case leaks the existence of that case. |
| **GPC honored** | [Cookies §Global Privacy Control](cookies.html#gpc); [Do not sell §GPC](do-not-sell.html#gpcd) | Required for CCPA-covered businesses; cheap to implement. |
| **Anti-notario warning** | Terms §[Not legal advice](terms.html#notlegal) | Consumer protection specific to this audience. |
| **Acceptable use bars enforcement and surveillance uses** | Terms §[Acceptable use](terms.html#acceptable) | Prohibits receipt-number enumeration, surveillance of individuals, and use for immigration enforcement. |

---

## Open items before publication

1. **Fill every `placeholder`** — highlighted in amber in the HTML. Entity name, address, email addresses, vendor names, URLs, dates, phone number.
2. **Confirm CCPA applicability** and whether the toll-free number requirement applies (it attaches to businesses that operate offline).
3. **Verify the cookie table** against what the application actually sets. The table currently claims five first-party cookies and no third parties — if that is wrong, it is a misrepresentation, not just an inaccuracy.
4. **Confirm the analytics vendor is genuinely cookieless.** The draft says so.
5. **Vendor DPAs must match the promises.** The policy commits third parties to no model training, no dataset combination, no retention after termination. Contracts need those clauses or the statement is false.
6. **Decide the dispute-resolution approach** (Terms §Disputes). Left blank deliberately — see the note there about this user base.
7. **Build the deletion mechanism before publishing the policy.** The 30/35-day commitments are enforceable promises, including backup rotation.
8. **Set up the transparency report and changelog URLs** before referencing them.
9. **Run the accessibility audit** before claiming "partially conformant" with a date.
10. **Spanish versions** — required for consistency with the site's bilingual promise, and CCPA notices must be provided in the language in which you ordinarily conduct business with the consumer.

---

*Prepared as a drafting aid. Not legal advice. Review by qualified counsel is required before publication.*
