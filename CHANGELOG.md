# Changelog

All model updates, assumption changes, and feature additions. Most recent first.

---

## [v0.4] — Mar 22, 2026
**PA Medicare guidance applied (source: PA MAC contact, Mar 2026)**

### Model changes
- **PsychNP psych E&M revenue: $169 → $199/mo.** Removed 85% NPP billing rate discount. Per PA guidance, billing rate does not vary by provider licensure — facility vs. non-facility setting is the determining factor. A non-facility provider means full rate applies regardless of whether provider is NP, MD, or psychiatrist.
- **PCM (99426/99427) removed from all scenarios.** Cannot be billed in the same calendar month as G codes. Previously marked unconfirmed — now confirmed as not allowed. A patient could switch between PCM and G code billing month-to-month but cannot stack them.

### Impact
- PsychNP and psychiatrist now produce identical psych E&M revenue (~$199/mo). Remaining differences: unlock cost ($37 PsychNP vs. $53 psychiatrist) and state supervision risk for PsychNP.
- PsychNP is now clearly the better hire on pure economics for most scenarios.
- 1-condition patient revenue reduced by ~$122/mo (PCM removed from scenarios where it was incorrectly stacked).

### Still open
- 85% NPP rate interpretation should be verified against CMS Benefit Policy Manual Chapter 15 §200 before relying on for billing. The PA MAC contact is primarily Medicaid — the Medicare-specific rule may differ.

---

## [v0.3] — Mar 20, 2026
**FFS Model page + CMS add-on unit guidance corrected**

### New features
- `/ffs` — Fee-for-Service Advocacy Model page. Minutes-first framing: advocate time = billed time, cost and revenue are tethered.
  - Per-code economics table: minutes required, revenue, advocate cost (same minutes × $40/hr), margin, $/min
  - Add-on units slider (1–15) — adjusts minutes and revenue together
  - Utilization scenarios at 100%, 76%, 60% of billable ceiling
  - E&M conversion risk section for LCSW patients (adjustable conversion rate)

### Assumption corrections
- **Add-on unit cap: removed "estimated at 2–3 units."** Per CY 2024 PFS Final Rule (CMS-1784-F) and CMS HRSN FAQ: no hard frequency cap on G0024, G0022, or G0146 in traditional Medicare. Only constraint is medical necessity documentation. No prior auth required for fee-for-service Medicare.
- **MA plans:** Must cover PIN/CHI as Part B benefits but may impose their own prior auth and unit limits at the plan level.
- **Add-on unit framing:** Changed from "appeals model" language to "higher utilization" — billing additional units is not an appeals process, it's standard billing with time documentation.
- At 3 add-on units: 150 min PIN + 150 min CHI + 20 min BHI = 320 min total (confirmed by clinical lead, Mar 2026).

### Key CMS sources
- CY 2024 PFS Final Rule: CMS-1784-F (Federal Register, Nov 16, 2023 — 88 FR 78818)
- MLN Matters MM13452
- CMS Health-Related Social Needs FAQ

---

## [v0.2] — Mar 22, 2026
**Multi-patient tools: Portfolio Modeler + Patient Dashboard**

### New features
- `/model` — Portfolio Modeler. Build cohorts (label + patient count + profile), see aggregate revenue across all 4 care team scenarios. Code breakdown table. Named snapshot save/load. JSON export.
- `/patients` — Patient Dashboard. Manual entry of individual patients. Per-patient eligible codes and revenue. Expandable 4-scenario detail. Aggregate opportunity gap summary. Locked patient alert.
- Shared `Nav` component replacing per-page inline links. Active state highlighting.
- Shared `ProfileForm` component extracted from main calculator.
- `lib/types.ts` — `Cohort`, `PortfolioSnapshot`, `Patient` interfaces.
- `lib/aggregate.ts` — `computePortfolioSummary()` and `computeDashboardSummary()` pure functions.
- `lib/useLocalStorage.ts` — typed localStorage hook with SSR safety.
- All data persists in browser localStorage. No backend required.

---

## [v0.1] — Mar 2026
**Initial build: single-patient calculator + code reference**

### Features
- `/` — Per-patient billing eligibility calculator. Configure patient profile (therapist type, conditions, SDOH, BH impact, add-on units), see 4 care team scenarios side by side.
- `/assumptions` — Full model assumptions reference with confidence flags.
- `/codes` — Billing code reference library. 16 codes across 8 categories. Expandable cards with patient criteria, unlock paths, stacking rules, nuances.

### Model
- 4 care team scenarios: Today / + PsychNP / + MD / + Psychiatrist
- Revenue: 2025 CMS Physician Fee Schedule, National Non-Facility rates (confirmed Jan 2025)
- Advocate cost: $40/hr. Cap utilization: 500 min ($333/mo). Real avg: 380 min ($253/mo) based on a 9-patient advocate time-tracking dataset.
- GP calculated at both cap and real avg utilization.
- Psychiatric E&M modeled separately as upside (not included in advocacy GP).

### Key rates
| Code | Service | Rate |
|------|---------|------|
| G0023 + G0024 | PIN base + add-on | $79.24 + $49.44/unit |
| G0019 + G0022 | CHI base + add-on | $79.24 + $49.44/unit |
| G0140 + G0146 | PIN-PS base + add-on | $79.24 + $49.44/unit |
| 99484 | BHI | $57.45 |
| 99213/99214/99215 + 90833 | Psych E&M + add-on | $147 / $186 / $227 |
