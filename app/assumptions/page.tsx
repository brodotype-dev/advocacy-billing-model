'use client'

import Nav from '@/components/Nav'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

function Row({ label, value, note, flag }: { label: string; value: string; note?: string; flag?: 'confirmed' | 'unconfirmed' | 'warning' }) {
  const badge =
    flag === 'confirmed' ? <span className="text-xs px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">✓ Confirmed</span>
    : flag === 'unconfirmed' ? <span className="text-xs px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200 font-medium">⚠ Unconfirmed</span>
    : flag === 'warning' ? <span className="text-xs px-2 py-0.5 rounded border bg-orange-50 text-orange-700 border-orange-200 font-medium">⚠ Caveat</span>
    : null

  return (
    <div className="flex items-start justify-between gap-6 py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {note && <p className="text-xs text-slate-500 mt-0.5">{note}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0 text-right">
        <span className="text-sm text-slate-700 font-mono">{value}</span>
        {badge}
      </div>
    </div>
  )
}

export default function AssumptionsPage() {
  return (
    <div className="min-h-screen">
      <Nav />

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Model Assumptions</h1>
          <p className="text-xs text-slate-500 mt-0.5">All inputs, rates, and logic behind the calculator</p>
        </div>

        {/* Billing rates */}
        <Section title="Billing Rates — 2025 CMS Physician Fee Schedule (National Non-Facility)">
          <Row label="G0023 / G0019 / G0140 — base 60 min" value="$79.24/mo" note="Up from $77.95 in 2024. Same rate for PIN, CHI, and PIN-PS." flag="confirmed" />
          <Row label="G0024 / G0022 / G0146 — add-on 30 min" value="$49.44/unit" note="Up from $48.52 in 2024. Applied per add-on unit billed." flag="confirmed" />
          <Row label="99484 — Behavioral Health Integration" value="$57.45/mo" flag="confirmed" />
          <Row label="99426 — PCM first 30 min" value="$67.80/mo" flag="confirmed" />
          <Row label="99427 — PCM add-on 30 min" value="$54.11/unit" flag="confirmed" />
          <Row label="99203 — E&M new patient (advocacy unlock)" value="$115.00" note="One-time visit in month 1 to establish medical necessity for LCSW patients." flag="confirmed" />
        </Section>

        {/* Add-on units */}
        <Section title="Add-on Units (G0024 / G0022 / G0146)">
          <Row label="CMS frequency limit" value="None" note="Per CY 2024 PFS Final Rule (CMS-1784-F) and CMS HRSN FAQ: no hard cap on add-on units per calendar month for G0024, G0022, or G0146. Traditional Medicare imposes no prior authorization requirement. Billing additional units requires documented medical necessity and time records (start/stop times or total time)." flag="confirmed" />
          <Row label="Base model" value="1 unit/mo" note="Conservative starting point. One 30-min add-on unit per G code family billed. Well within any reasonable medical necessity threshold." flag="confirmed" />
          <Row
            label="Higher utilization"
            value="3–15+ units/mo"
            note="At 3 units: 150 min PIN + 150 min CHI + 20 min BHI = 320 min total. Add 150 min PCM = 470 min. Some companies bill 15+ units/month. No CMS ceiling — the only constraint is documented time and medical necessity. MA plans may impose their own prior auth or unit limits independent of Medicare fee-for-service rules."
            flag="confirmed"
          />
          <Row label="Medicare Advantage" value="Plan-specific" note="MA plans must cover PIN/CHI as Part B benefits but may impose prior authorization and unit limits at the plan level. No standard cross-plan ceiling. Check individual plan coverage policies." flag="warning" />
        </Section>

        {/* Advocate cost */}
        <Section title="Advocate Cost">
          <Row label="Hourly rate" value="$40/hr" note="Standard navigator/advocate rate used across all scenarios." flag="confirmed" />
          <Row label="Monthly minutes — cap utilization" value="500 min ($333/mo)" note="Billable cap per patient per month. Worst-case cost scenario." flag="confirmed" />
          <Row label="Monthly minutes — real average" value="380 min ($253/mo)" note="The health advocate's actual average across established patients. Used for 'real avg' GP row." flag="confirmed" />
          <Row label="Patient-facing vs. non-patient-facing split" value="1.0× vs. 5.5×" note="Per expansion model: ~1 hr direct contact, ~5.5 hrs non-patient coordination per patient per month." flag="confirmed" />
        </Section>

        {/* Provider unlock costs */}
        <Section title="Provider Unlock Costs (E&M Visit, Month 1 Only)">
          <Row label="PsychNP contracted rate" value="$110/hr → $37 for 20 min" note="Contracted PsychNP. 20-min visit in month 1 establishes medical necessity. Chart review only in subsequent months — no additional patient contact required." flag="confirmed" />
          <Row label="MD contracted rate" value="$150/hr → $50 for 20 min" note="General/internal medicine MD. Same advocacy code unlock as PsychNP. Higher cost with no additional billing upside for advocacy." flag="confirmed" />
          <Row label="Psychiatrist contracted rate" value="$160/hr → $53 for 20 min" note="Same advocacy unlock as PsychNP/MD. Higher cost offset by psychiatric E&M revenue if also seeing patients." flag="confirmed" />
          <Row
            label="PsychNP state supervision risk"
            value="Varies by state"
            note="~half of US states require physician oversight for NPs (non-full-practice-authority states). In those states, hiring a PsychNP also requires a supervising MD, which can eliminate the cost advantage entirely. Confirm operating states before relying on PsychNP as lowest-cost scenario."
            flag="warning"
          />
        </Section>

        {/* GP calculation */}
        <Section title="Gross Profit Calculation">
          <Row label="GP Month 1" value="Revenue − Advocate cost − E&M cost" note="E&M unlock visit cost only applies in month 1." />
          <Row label="GP Month 2+ (at cap)" value="Revenue − $333" note="Full 500-min advocate cost. Worst-case ongoing margin." />
          <Row label="GP Month 2+ (real avg)" value="Revenue − $253" note="380-min real average. Positive GP on base codes without appeals." />
          <Row label="NPP billing rate" value="Non-facility = 100% regardless of licensure" note="Per PA Medicare guidance (PA MAC contact, Mar 2026): billing rate does not vary by provider type (NP vs. MD vs. psychiatrist). The facility vs. non-facility distinction drives the rate difference. The provider operating as non-facility means full non-facility rate applies to all providers. Verify against CMS Chapter 15 §200 before relying on for billing." flag="confirmed" />
        </Section>

        {/* Psychiatric E&M */}
        <Section title="Psychiatric E&M (Separate from Advocacy — Shown as Upside Only)">
          <Row label="Complexity mix (per clinical lead)" value="30% low / 10% moderate / 60% high" note="The provider's senior population skews high-complexity due to polypharmacy, cognitive decline, and multi-morbidity." flag="confirmed" />
          <Row label="PsychNP — weighted avg E&M/mo" value="~$199/mo per patient" note="Non-facility rate. Per PA Medicare guidance (Mar 2026), billing rate does not vary by provider licensure — facility vs. non-facility is the key distinction. Low: 99213+90833=$147. Moderate: 99214+90833=$186. High: 99215+90833=$227." flag="confirmed" />
          <Row label="Psychiatrist — weighted avg E&M/mo" value="~$199/mo per patient" note="Non-facility rate, same as PsychNP. Low: 99213+90833=$147. Moderate: 99214+90833=$186. High: 99215+90833=$227. Psychiatrist also unlocks CoCM at scale." flag="confirmed" />
          <Row label="90863 (med management only)" value="Not modeled" note="Per clinical lead: 90863 pays much less than 99214+90833. Always prefer E&M + 90833 add-on over 90863." flag="confirmed" />
          <Row label="CoCM (99492/99493/99494)" value="Out of scope" note="Psychiatrist unlocks CoCM at scale (~$172k/year additional at 100+ patients). Prerequisites: the billing platform v2 live, active patient registry, ≥150 LCSW patients. Revisit Phase 2." flag="confirmed" />
        </Section>

        {/* Eligibility rules */}
        <Section title="Code Eligibility Rules">
          <Row label="PIN (G0023) unlock — psychologist patients" value="90791 establishes medical necessity" note="Psychologist's diagnostic evaluation likely qualifies. Not explicitly confirmed in CMS guidance for G0023." flag="unconfirmed" />
          <Row label="PIN (G0023) unlock — LCSW patients" value="MD/NP E&M (99203) required" note="One-time visit in month 1. Subsequent months chart review only." flag="confirmed" />
          <Row label="PIN-PS (G0140) over PIN (G0023)" value="Preferred when patient qualifies" note="PIN-PS requires 2+ conditions + BH impact. The clinical lead's note: appeal success may be higher for G0146 than G0024. Always choose PIN-PS when eligible." flag="confirmed" />
          <Row label="PIN and PIN-PS mutual exclusivity" value="Cannot bill both same month" note="Choose one per patient per month. Model always picks PIN-PS when patient qualifies." flag="confirmed" />
          <Row label="CHI (G0019) — psychologist unlock" value="Likely via 90791" note="Same logic as PIN, but CHI-specific confirmation not found in CMS guidance. Validate before billing." flag="unconfirmed" />
          <Row label="BHI (99484) supervision" value="Likely requires MD/NP" note="Psychologist supervision alone may not be sufficient for BHI. Monthly vs. episodic billing also unconfirmed." flag="unconfirmed" />
          <Row label="PCM + G code stacking" value="Not allowed — same month" note="Per PA Medicare guidance (PA MAC contact, Mar 2026): PCM and G codes cannot be billed in the same calendar month for the same patient. PCM is excluded from all scenarios. A patient could switch between PCM and G code billing month-to-month, but not stack them." flag="confirmed" />
          <Row label="CCM (99490/99439)" value="Not applicable for the provider" note="Chronic Care Management requires a PCP. The provider does not have a PCP in the care model. CCM is excluded from all scenarios despite appearing in original expansion model use cases." flag="confirmed" />
        </Section>

        {/* Patient profile */}
        <Section title="Patient Profile Inputs">
          <Row label="Therapist type" value="Psychologist or LCSW" note="Determines unlock path. Psychologist 90791 may unlock G codes directly; LCSW requires an E&M visit from a separate provider." />
          <Row label="Chronic conditions" value="1 or 2+" note="2+ required for PIN-PS eligibility. Each condition must be serious, expected to last ≥3 months. Single condition qualifies for PIN." />
          <Row label="SDOH risk factor" value="Yes / No" note="Required for CHI (G0019). Must be documented — ideally as a Z-code (Z59.x housing, Z59.4 food, Z60.x social isolation). CHI stacks with PIN or PIN-PS." />
          <Row
            label="BH condition affects physical care"
            value="Yes / No"
            note="Required for PIN-PS. Patient must have a documented BH diagnosis (F-code) AND therapist notes must explicitly link it to management of physical conditions. Direction matters: BH → physical. 'Patient has depression' alone does not qualify — 'patient's depression is impacting diabetes management' does."
          />
        </Section>

        {/* Sources */}
        <Section title="Sources">
          <Row label="Billing rates" value="2025 CMS PFS" note="Confirmed from 2025 Physician Fee Schedule, National Non-Facility. Effective Jan 1, 2025." flag="confirmed" />
          <Row label="Advocate utilization data" value="Health advocate — 9 active patients" note="380 min/month real average based on actual time tracking. Used for 'real avg' GP row." flag="confirmed" />
          <Row label="Complexity mix" value="Clinical lead estimate" note="30% low / 10% moderate / 60% high. Based on the provider's senior population characteristics (polypharmacy, cognitive decline)." flag="confirmed" />
          <Row label="Provider hourly rates" value="Clinical lead / expansion model" note="PsychNP $110/hr, MD $150/hr, Psychiatrist $160/hr. Contracted rates — may vary." flag="confirmed" />
          <Row label="Stacking rules, unit caps, unlock paths" value="Unconfirmed" note="MAC call + CPT advisor + billing partner needed to confirm. See Open Questions on calculator page." flag="unconfirmed" />
        </Section>

        <p className="text-xs text-slate-400 text-center pb-4">
          Advocacy Billing Model · Mervin · {new Date().getFullYear()}<br />Made by <a href="https://brodyclemmer.com/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 underline">Brody Clemmer</a><br />
          Not legal or compliance advice. Validate unconfirmed rules with your MAC or billing counsel before relying on them.
        </p>

      </main>
    </div>
  )
}
