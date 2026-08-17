# Advocacy Billing Model

A modeling tool for Medicare healthcare-advocacy billing. It answers two questions: what can a provider bill for a given patient, and what does that look like at scale?

In 2024 CMS introduced a new family of G codes — Principal Illness Navigation (PIN), Community Health Integration (CHI), and their peer-support variants — that let care teams bill for non-clinical advocacy work: benefits navigation, social-needs coordination, care-team communication. The codes are real revenue, but eligibility depends on a tangle of interacting conditions: who the patient's therapist is, how many chronic conditions they carry, whether a social-needs risk factor is documented, and which licensed provider signs the chart. Getting that wrong means either leaving money on the table or billing something that won't survive review.

This tool encodes those rules and makes the economics legible — per patient, per care-team configuration, and across a portfolio.

**Not legal or compliance advice.** Rates and rules are modeled from public CMS sources; validate against your MAC before billing.

*A self-directed Mervin project — a study in turning ambiguous regulatory rules into a decision tool.*

---

## What it does

Eight pages, each answering a different question:

| Route | Tool | Question it answers |
|-------|------|-------------------|
| `/` | Calculator | What codes and revenue does one patient generate under each care team scenario? |
| `/model` | Portfolio Modeler | Given X patients of type Y, what's aggregate monthly revenue and gross profit? |
| `/patients` | Patient Dashboard | Per patient, what are they eligible for — and what's being left on the table? |
| `/ffs` | FFS Model | In a pure fee-for-service model where advocate time = billed time, what are the per-minute economics? |
| `/psychiatry` | Psychiatry Model | Does hiring a psychiatrist or PsychNP pay for itself, and at what patient volume? |
| `/primary-care` | Primary Care MD Model | Same question for a Family Practice MD — whose real value is unlocking billing via chart supervision. |
| `/assumptions` | Assumptions | What are the rates, rules, and confidence levels behind every number in the model? |
| `/codes` | Code Reference | Full definitions, patient criteria, unlock paths, and stacking rules for all 16 billing codes. |

---

## The model

### Care team scenarios

Every calculation runs across 4 scenarios:

- **Today** — What can we bill right now, with no new hires? (Psychologist patients may have some codes unlocked; LCSW patients are locked without an E&M visit.)
- **+ PsychNP** — Add a psychiatric NP at $110/hr. Unlock cost: $37/patient in month 1. Supervision risk in ~half of US states.
- **+ MD** — Add a general/internal medicine MD at $150/hr. Unlock cost: $50/patient in month 1. Same advocacy codes as PsychNP.
- **+ Psychiatrist** — Add a psychiatrist at $160/hr. Unlock cost: $53/patient in month 1. Also unlocks psych E&M billing and CoCM at scale.

### Patient profile inputs

| Input | Options | Why it matters |
|-------|---------|----------------|
| Therapist type | Psychologist / LCSW | Determines unlock path. LCSW requires E&M visit to bill G codes. |
| Chronic conditions | 1 / 2+ | 2+ required for PIN-PS (higher revenue). |
| SDOH risk factor | Yes / No | Unlocks CHI (G0019/G0022) stacked on top of PIN. |
| BH affects physical care | Yes / No | Required for PIN-PS. F-code diagnosis + therapist notes linking BH to physical condition management. |
| Add-on units | 1–15 | Each unit = 30 min billed per G code family. No CMS cap — medical necessity documentation required. |

### Billing codes in scope

| Code(s) | Service | Monthly rate | Status |
|---------|---------|-------------|--------|
| G0023 + G0024 | PIN (base + add-on) | $79.24 + $49.44/unit | Confirmed |
| G0019 + G0022 | CHI (base + add-on) | $79.24 + $49.44/unit | Confirmed |
| G0140 + G0146 | PIN-PS (base + add-on) | $79.24 + $49.44/unit | Psychologist unlock unconfirmed |
| 99484 | BHI | $57.45 | Monthly vs. episodic unconfirmed |
| 99213/14/15 + 90833 | Psych E&M + add-on | $147 / $186 / $227 | Confirmed |

Rates: 2025 CMS Physician Fee Schedule, National Non-Facility.

### Cost assumptions

| Item | Amount | Source |
|------|--------|--------|
| Advocate rate | $40/hr | Standard navigator rate |
| Cap utilization | 500 min/mo = $333 | Billable ceiling |
| Real avg utilization | 380 min/mo = $253 | Health advocate — 9 active patients |
| PsychNP unlock (month 1) | $37/patient | $110/hr × 20 min |
| MD unlock (month 1) | $50/patient | $150/hr × 20 min |
| Psychiatrist unlock (month 1) | $53/patient | $160/hr × 20 min |

### Key confirmed decisions

- **PCM (99426/99427) excluded.** Cannot be billed in the same calendar month as G codes. Confirmed by PA Medicare guidance (Mar 2026).
- **No NPP billing rate discount.** Rate does not vary by provider licensure (NP vs. MD) — facility vs. non-facility setting is the key distinction. A non-facility provider bills at full rate. Confirmed by PA Medicare guidance (Mar 2026). Verify against CMS Benefit Policy Manual Ch. 15 §200 before relying on for billing.
- **No hard cap on add-on units** in traditional Medicare. Confirmed by CMS CY 2024 PFS Final Rule (CMS-1784-F) and HRSN FAQ. MA plans may impose their own limits.
- **Psych E&M modeled as upside only**, not included in advocacy GP. Applies when PsychNP or psychiatrist also sees patients for medication management.

---

## Open questions

These affect model accuracy and need MAC or billing expert confirmation before relying on for billing:

1. **Psychologist 90791 as G code unlock** — Does a psychologist's diagnostic evaluation satisfy the initiating E/M requirement for G0023, G0019, G0140? Or does it require a separate medical E/M?
2. **BHI supervision** — Can a psychologist supervise BHI (99484) alone, or does it require MD/NP?
3. **BHI billing frequency** — Monthly or episodic?
4. **Add-on unit documentation standard** — What does the PA MAC expect for high-volume add-on unit claims? Start/stop times vs. total time attestation?
5. **MA plan limits** — Which MA plans operating in PA have published prior auth requirements for PIN/CHI codes?
6. **NPP rate verification** — Confirm facility vs. non-facility interpretation against CMS Benefit Policy Manual Ch. 15 §200.

---

## Tech stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- localStorage for all data persistence (Portfolio Modeler, Patient Dashboard)

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying

Deployed via Vercel. Push to `main` triggers a deploy.

---

## Sources

Operational assumptions are attributed by role rather than by name. Each is surfaced in the app on `/assumptions` with a confidence flag (confirmed / unconfirmed), so no number in the model is untraceable.

| Source role | Contributes |
|-------------|-------------|
| Health advocate | 380 min/mo real average utilization (9-patient time-tracking dataset) |
| Clinical lead | Complexity mix (30% low / 10% mod / 60% high), model direction |
| PA MAC contact | NPP rate guidance, PCM stacking confirmation (Mar 2026) |
| RCM lead | Add-on unit caps, billing operations |
| CPT advisor | Code eligibility rules |
| Billing partner | G code unlock paths, MA plan rules |
| Consulting psychiatrist | Psychiatry staffing model, supervision risk |

**CMS sources:**
- CY 2024 PFS Final Rule: CMS-1784-F (88 FR 78818, Nov 16 2023)
- MLN Matters MM13452
- CMS Health-Related Social Needs FAQ
- CMS Benefit Policy Manual, Publication 100-02, Ch. 15

---

*Not legal or compliance advice · Validate unconfirmed rules with your MAC or billing counsel before billing.*
