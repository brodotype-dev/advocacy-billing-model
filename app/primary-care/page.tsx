'use client'

import Nav from '@/components/Nav'

export default function PrimaryCarePage() {
  return (
    <div className="min-h-screen">
      <Nav />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">Primary Care MD Model</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Modeling the business case for adding a Family Practice MD or PCP to the care team.
            Distinct from the Psychiatry model — this role is supervision, advocacy evaluation, and
            care coordination with existing PCPs. Not direct primary care.
          </p>
          <span className="inline-block mt-3 text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded border border-amber-200">
            Revenue model in progress — some open questions remain
          </span>
        </div>

        {/* Role definition */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Role Definition</h3>
          <p className="text-sm text-slate-600">
            The MD&apos;s primary function in this model is <span className="font-medium text-slate-800">supervision and advocacy evaluation</span> —
            not direct primary care. Key assumption: most geriatric patients already have a PCP managing their
            medications. The provider&apos;s MD is not meant to replace that relationship. Introducing overlapping
            med management would create conflicts and likely create issues with payers and the existing care team.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <p className="font-semibold text-emerald-800 mb-1">Chart supervision</p>
              <p className="text-emerald-700 text-xs">
                Oversees chart notes and sign-offs for the advocacy team. Required for LCSW patients
                to unlock PIN/CHI billing — the primary financial case for this hire.
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <p className="font-semibold text-emerald-800 mb-1">Advocacy intake &amp; evaluation</p>
              <p className="text-emerald-700 text-xs">
                Evaluates whether patients are eligible for advocacy services. Provides the E&M visit
                (99203) that unlocks the advocacy billing stack in month 1.
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <p className="font-semibold text-emerald-800 mb-1">Follow-up meetings</p>
              <p className="text-emerald-700 text-xs">
                Direct meetings with patients when medically indicated — comorbidity review, how
                behavioral health interacts with physical conditions, coordination with existing PCP.
              </p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs text-slate-600">
            <span className="font-medium">Future option noted:</span> If the provider ever moves into med management,
            a PCP could provide that — but that becomes a fundamentally different business (direct care model).
            Not in scope for this phase.
          </div>
        </section>

        {/* How this differs from Psychiatry */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            How this differs from the Psychiatry model
          </h3>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Dimension</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Primary Care MD</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">PsychNP / Psychiatrist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ['Primary purpose', 'Supervision + advocacy unlock', 'Psychiatric medication management'],
                  ['Billing codes', '99203 (unlock) + 99213–99215 (follow-up)', '90792, 99213–99215 + 90833'],
                  ['Psychotherapy add-on (90833)', 'No', 'Yes — when therapy delivered in session'],
                  ['Psychiatric eval (90792)', 'No', 'Yes'],
                  ['Advocacy billing unlock', 'Yes — primary use case', 'Yes — also unlocks'],
                  ['Med management', 'No (this phase)', 'Yes'],
                  ['Chart supervision of PsychNP', 'State-dependent — see Q6 below', 'Psychiatrist can; PsychNP needs MD'],
                  ['CoCM unlock', 'No', 'Psychiatrist only'],
                  ['Est. hourly rate', '$150–$200 (contract/locum)', '$100 NP · $250 Psychiatrist'],
                  ['Hire difficulty', 'Easier — larger supply', 'Harder, especially Psychiatrist'],
                ].map(([dim, pc, psych], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-5 py-3 font-medium text-slate-700">{dim}</td>
                    <td className="px-5 py-3 text-slate-600">{pc}</td>
                    <td className="px-5 py-3 text-slate-500">{psych}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Coming soon */}
        <section className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center space-y-2">
          <p className="font-semibold text-slate-600">Revenue model coming soon</p>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Once Q3 (direct care cadence) and Q4 (advocacy billing unlock confirmation) are answered,
            this page will include an hourly rate × capacity model with advocacy unlock value as the
            primary return driver.
          </p>
        </section>

        {/* Open questions */}
        <section className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-100">
            <p className="font-semibold text-amber-700">Open Questions — Primary Care MD</p>
          </div>
          <div className="divide-y divide-amber-50">

            {/* Q1 — Answered */}
            <div className="px-5 py-4 bg-emerald-50/40">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-slate-800 text-sm">1. What is the MD&apos;s primary role?</p>
                <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 shrink-0">Answered</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Supervision (chart sign-offs) + advocacy intake/eligibility evaluation + follow-up meetings when medically indicated.
                Not direct primary care. Coordinates with patients&apos; existing PCPs — does not replace them.
              </p>
            </div>

            {/* Q2 — Answered */}
            <div className="px-5 py-4 bg-emerald-50/40">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-slate-800 text-sm">2. What states does the provider operate in?</p>
                <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 shrink-0">Answered</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 mb-2">
                46 jurisdictions (45 states + DC). Notably includes California, Massachusetts, and Florida —
                the three states confirmed in Q6 as having explicit specialty-match requirements for PsychNP supervision.
                NP supervision rules vary across this footprint — see Q6.
              </p>
              <div className="flex flex-wrap gap-1">
                {[
                  'Alabama','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
                  'Florida','Georgia','Idaho','Illinois','Indiana','Kansas','Kentucky','Maine',
                  'Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri',
                  'Montana','Nebraska','Nevada','New Hampshire','New Jersey','North Carolina',
                  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
                  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
                  'Virginia','Washington','Washington DC','West Virginia','Wisconsin','Wyoming',
                ].map(state => {
                  const flagged = ['California','Massachusetts','Florida'].includes(state)
                  return (
                    <span
                      key={state}
                      className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                        flagged
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {state}
                    </span>
                  )
                })}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Red = confirmed specialty-match requirement for PsychNP supervision (see Q6).
              </p>
            </div>

            {/* Q3 — Researched */}
            <div className="px-5 py-4 bg-emerald-50/40">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-slate-800 text-sm">3. Does the MD need to provide direct care at some minimum cadence?</p>
                <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 shrink-0">Researched — model likely clears this</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                <span className="font-medium">The short answer:</span> No state imposes a specific minimum visit count.
                The risk isn&apos;t a numeric threshold — it&apos;s whether the MD is genuinely practicing medicine vs.
                being a rubber stamp. The provider&apos;s model as described almost certainly clears this bar.
              </p>
              <div className="mt-2 space-y-2 text-xs text-slate-600">
                <p>
                  <span className="font-medium">Does an advocacy evaluation count as direct care?</span> Yes.
                  A patient intake or eligibility evaluation involves taking a history, applying clinical judgment,
                  and making a care determination — this is practicing medicine by every state board&apos;s definition.
                  It&apos;s billed as a 99203/99204 E&M visit, which is direct patient care by definition.
                </p>
                <p>
                  <span className="font-medium">Do follow-up meetings count?</span> Yes, if they involve clinical
                  assessment. A meeting where the MD reviews the patient&apos;s condition, discusses comorbidities,
                  and provides medical guidance is a clinical encounter — billable as 99213–99215.
                </p>
                <p>
                  <span className="font-medium">What&apos;s the actual risk scenario?</span> The problem the consulting psychiatrist flagged —
                  and what state boards and CMS actually go after — is an MD who has zero patient contact and
                  only rubber-stamps charts or acts as a referral channel. That&apos;s where enforcement actions happen.
                  The provider&apos;s model (evaluations + follow-ups + supervision) is structurally different from that.
                </p>
                <p>
                  <span className="font-medium">What about chart-only supervision?</span> Chart review alone does
                  constitute practicing medicine in most states — so even the supervision function carries real
                  liability. The MD must be genuinely engaged, not a figurehead. High-profile enforcement actions
                  have targeted physicians who signed off on care they weren&apos;t meaningfully overseeing.
                </p>
              </div>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-3 py-2 mt-2">
                <span className="font-medium">Still recommended:</span> Confirm with healthcare compliance counsel
                in the provider&apos;s primary operating states (particularly CA, FL, TX) that the intake evaluation +
                follow-up structure satisfies any state-specific direct care expectations. This is a low-cost
                validation given the hire&apos;s financial and legal significance.
              </p>
            </div>

            {/* Q4 — Answered */}
            <div className="px-5 py-4 bg-emerald-50/40">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-slate-800 text-sm">4. Does adding an FP MD confirm the full advocacy billing unlock (PIN/CHI)?</p>
                <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 shrink-0">Answered — yes</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                <span className="font-medium">Confirmed.</span> CMS specifies no specialty requirement for billing or supervising
                PIN (G0023/G0024/G0140/G0146) and CHI (G0019/G0022). The AAFP publishes its own coding guidance
                for family practice MDs billing these exact codes — confirming they are within FP MD scope.
              </p>
              <div className="mt-2 space-y-1 text-xs text-slate-600">
                <p>
                  <span className="font-medium">Initiating visit:</span> Any E&M visit (99203–99215, excluding 99211),
                  annual wellness visit, or psychiatric diagnostic evaluation (90791) qualifies.
                  A standard new-patient visit (99203) by the FP MD is sufficient.
                </p>
                <p>
                  <span className="font-medium">Ongoing supervision:</span> &ldquo;General supervision&rdquo; only —
                  MD does not need to be present during navigator sessions. Must be available and serve
                  as the billing practitioner.
                </p>
                <p>
                  <span className="font-medium">2026 expansion:</span> As of CY 2026, PIN/CHI services can also be
                  personally performed by Marriage and Family Therapists and Mental Health Counselors without a
                  physician unlock — potentially reducing the provider&apos;s dependence on an MD for this function over time.
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Still recommended: confirm with your MAC before billing at scale. This is the primary financial
                case for the hire — worth a direct validation call.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Sources: AAFP Coding for PIN Services (G0023/G0024/G0140/G0146) · CMS 2025 PFS
              </p>
            </div>

            {/* Q5 — Answered */}
            <div className="px-5 py-4 bg-emerald-50/40">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-slate-800 text-sm">5. What&apos;s the right contract structure?</p>
                <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 shrink-0">Answered</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Part-time employed or hourly contract. Not a full-time salaried hire, at least to start.
                Revenue model will use hourly rate × hours/month, same structure as the Psychiatry model.
              </p>
            </div>

            {/* Q6 — Answered */}
            <div className="px-5 py-4 bg-red-50/40">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-slate-800 text-sm">6. Can the FP MD also serve as supervising physician for a PsychNP?</p>
                <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200 shrink-0">Answered — effectively no</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                <span className="font-medium">Short answer:</span> No — not reliably, and not safely for a multi-state operator.
                Your instinct was correct.
              </p>
              <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                <p>
                  <span className="font-medium">California (explicit prohibition):</span> 16 CCR §1482.3 requires the supervising
                  physician to specialize in the same area as the NP. A FP MD cannot supervise a PsychNP under California law.
                </p>
                <p>
                  <span className="font-medium">Massachusetts &amp; Florida:</span> Strong specialty-alignment requirements — psychiatric
                  NPs must work with psychiatry-trained physicians.
                </p>
                <p>
                  <span className="font-medium">Other restricted-practice states:</span> Even where state law is silent on specialty
                  matching, scope-of-practice language limits the supervising MD to acts within their own training. A FP MD overseeing
                  complex psychopharmacology is arguably outside their scope — and indefensible in a malpractice or audit scenario.
                </p>
                <p>
                  <span className="font-medium">CMS/Medicare:</span> No explicit specialty-match rule, but CMS also prohibits
                  supervising a clinician whose scope is outside the supervisor&apos;s own. Incident-to billing of psychiatric services
                  under a FP MD invites audit risk.
                </p>
                <p>
                  <span className="font-medium">Industry standard:</span> Major telehealth platforms (Rula, Wheel) explicitly require
                  the collaborating physician to be a psychiatrist or psychiatry-trained MD. A FP MD does not qualify. The APA&apos;s
                  position is the same.
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Implication for the provider: If a PsychNP is ever hired, the supervising physician must be a psychiatrist (or physician
                with documented psychiatric training) — not the FP MD. These are two separate hires.
              </p>
              <p className="text-xs text-slate-400 mt-1.5">
                Sources: 16 CCR §1482.3 (CA) · AAFP Team-Based Care FAQ · CMS APRNs · Rula CPA Guide · Psychiatric News 2025 · GuardianMD 50-state guide
              </p>
            </div>

            {/* Q7 — Answered */}
            <div className="px-5 py-4 bg-emerald-50/40">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-slate-800 text-sm">7. What EMR and documentation requirements come with adding an MD?</p>
                <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 shrink-0">Answered</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Existing licensure tracking and credentialing infrastructure already in place — same process
                extends to an MD. No new systems required; just onboarding into existing workflows.
              </p>
            </div>

          </div>
        </section>

        <p className="text-xs text-slate-400 text-center pb-4">
          Advocacy Billing Model · Mervin · {new Date().getFullYear()}
        </p>
      </main>
    </div>
  )
}
