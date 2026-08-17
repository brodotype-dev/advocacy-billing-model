'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getScenarios, type PatientProfile, type CareTeamScenario } from '@/lib/eligibility'
import Nav from '@/components/Nav'
import ProfileForm from '@/components/ProfileForm'

const OPEN_QUESTIONS = [
  { q: 'Does psychologist 90791 unlock CHI (G0019) and PIN-PS (G0140)?', impact: 'Determines if psychologist patients can bill CHI + PIN-PS without adding a provider.', who: 'MAC, CPT advisor, billing partner' },
  { q: 'Confirmed 2025 unit cap for G0024, G0022, G0146 add-ons?', impact: 'Each extra unit adds ~$55/mo. Cap of 1 vs. 2–3 changes appeal scenario revenue materially.', who: 'MAC, RCM lead' },
  { q: 'Can PCM (99426/99427) and G codes stack in the same month?', impact: '+$112/mo for 1-condition patients. Archetypes with single condition only.', who: 'MAC, CPT advisor' },
  { q: '85% NPP discount — does it apply to G codes billed under PsychNP supervision?', impact: 'Reduces all PsychNP-supervised G code revenue by ~15% (~$47/mo/patient).', who: 'MAC, billing partner' },
  { q: 'Is BHI (99484) billable every month or episodic?', impact: 'Affects whether it\'s a consistent $57/mo revenue line or one-time.', who: 'MAC, CPT advisor' },
  { q: 'Does BHI require MD/NP supervision or can a psychologist supervise?', impact: 'Determines if psychologist patients can add BHI without a new hire.', who: 'MAC' },
]

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function GPBadge({ value }: { value: number }) {
  if (value > 0) return <span className="font-semibold text-emerald-600">{fmt(value)}</span>
  if (value < -50) return <span className="font-semibold text-red-500">{fmt(value)}</span>
  return <span className="font-semibold text-amber-600">{fmt(value)}</span>
}


function ScenarioCard({ scenario, isRecommended }: { scenario: CareTeamScenario; isRecommended: boolean }) {
  if (scenario.locked) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{scenario.label}</h3>
        </div>
        <div className="flex items-center justify-center h-24 rounded-lg bg-slate-50 border border-dashed border-slate-200">
          <p className="text-sm text-slate-400">No unlock path — LCSW patients require MD/NP E&M</p>
        </div>
        <div className="text-center">
          <span className="text-2xl font-bold text-slate-300">—</span>
          <p className="text-xs text-slate-400 mt-0.5">monthly revenue</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl border p-5 flex flex-col gap-4 ${isRecommended ? 'border-blue-300 ring-1 ring-blue-200' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{scenario.label}</h3>
        {isRecommended && (
          <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">
            Recommended
          </span>
        )}
      </div>

      {/* Scenario note */}
      {scenario.note && (
        <p className="text-xs text-slate-500 -mt-1">{scenario.note}</p>
      )}

      {/* State supervision warning */}
      {scenario.supervisionWarning && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 -mt-1">
          <p className="text-xs text-orange-700">{scenario.supervisionWarning}</p>
        </div>
      )}

      {/* Eligible codes */}
      <div className="flex flex-wrap gap-1.5">
        {scenario.eligibleCodes.map((c) => (
          <span
            key={c.codes}
            className={`text-xs px-2 py-1 rounded-md font-mono ${
              c.unconfirmed
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {c.name} {c.unconfirmed && '⚠️'}
          </span>
        ))}
      </div>

      {/* Revenue */}
      <div className="text-center py-2 bg-slate-50 rounded-lg">
        <p className="text-2xl font-bold text-slate-900">{fmt(scenario.totalMonthlyRev)}</p>
        <p className="text-xs text-slate-500 mt-0.5">monthly revenue</p>
      </div>

      {/* Cost breakdown */}
      <div className="space-y-1.5 text-sm">
        {scenario.eMCostMonth1 > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-500">E&M cost (month 1)</span>
            <span className="text-slate-700">−{fmt(scenario.eMCostMonth1)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">Advocate cost (500 min)</span>
          <span className="text-slate-700">−{fmt(scenario.advocateCostAt500)}</span>
        </div>
        <div className="border-t border-slate-100 pt-1.5 flex justify-between">
          <span className="text-slate-500 font-medium">GP month 1</span>
          <GPBadge value={scenario.gpMonth1At500} />
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 font-medium">GP month 2+ (at cap)</span>
          <GPBadge value={scenario.gpMonth2At500} />
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">GP month 2+ (real avg 380 min)</span>
          <GPBadge value={scenario.gpMonth2Real} />
        </div>
      </div>

      {/* Psychiatric E&M upside */}
      {scenario.psychEmMonthly != null && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          <p className="text-xs font-semibold text-blue-700 mb-0.5">
            + Psych E&M (if also seeing patients): ~{fmt(scenario.psychEmMonthly)}/mo
          </p>
          <p className="text-xs text-blue-600">{scenario.psychEmNote}</p>
        </div>
      )}

      {/* Warnings */}
      {scenario.warnings.length > 0 && (
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
          <p className="text-xs font-semibold text-amber-700 mb-1">Unconfirmed rules</p>
          <ul className="space-y-0.5">
            {[...new Set(scenario.warnings)].map((w, i) => (
              <li key={i} className="text-xs text-amber-700">⚠️ {w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


function OpenQuestions() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-amber-50 transition-colors"
      >
        <span className="font-semibold text-amber-700">⚠️ Open Questions — Validate Before Billing</span>
        <span className="text-amber-400 text-sm">{open ? '▲ hide' : '▼ show'} ({OPEN_QUESTIONS.length})</span>
      </button>
      {open && (
        <div className="border-t border-amber-100 divide-y divide-amber-50">
          {OPEN_QUESTIONS.map((q, i) => (
            <div key={i} className="px-5 py-4">
              <p className="font-medium text-slate-800 text-sm">{i + 1}. {q.q}</p>
              <p className="text-sm text-slate-600 mt-1">{q.impact}</p>
              <p className="text-xs text-amber-600 mt-1">Ask: {q.who}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const [profile, setProfile] = useState<PatientProfile>({
    therapistType: 'lcsw',
    conditions: 'multiple',
    sdoh: true,
    bhImpact: true,
    includeAppeals: false,
  })

  const scenarios = getScenarios(profile)
  const unlockedScenarios = scenarios.filter(s => !s.locked)
  const recommendedLabel = unlockedScenarios.length > 0 ? unlockedScenarios[0].label : null
  // First hired scenario (PsychNP) used as the reference for GP callout and code breakdown
  const referenceScenario = scenarios.find(s => s.label === '+ PsychNP') ?? scenarios[1]

  // Determine if any scenario has an archetype warning
  const anyUnconfirmed = scenarios.some(s => s.warnings.length > 0)

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Patient Profile */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">Patient Profile</h2>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <ProfileForm profile={profile} onChange={setProfile} />

            {/* Patient archetype label */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                <span className="font-medium text-slate-700">Profile: </span>
                {profile.therapistType === 'psychologist' ? 'Psychologist' : 'LCSW'} patient ·{' '}
                {profile.conditions === 'multiple' ? '2+ conditions' : '1 condition'}
                {profile.sdoh ? ' · SDOH risk' : ''}
                {profile.bhImpact ? ' · BH affects physical care' : ''}
                {profile.includeAppeals ? ' · appeal units modeled' : ''}
              </p>
            </div>
          </div>
        </section>

        {/* Opportunity Matrix */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">Opportunity by Care Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {scenarios.map((s) => (
              <ScenarioCard
                key={s.label}
                scenario={s}
                isRecommended={!s.locked && s.label === recommendedLabel}
              />
            ))}
          </div>

          {/* GP callout */}
          {!referenceScenario.locked && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg px-5 py-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Real utilization note:</span> the health advocate's established patients average 380 min/month (not 500). At 380 min, advocate cost drops to ~$253/month — making{' '}
                {referenceScenario.gpMonth2Real > 0
                  ? `the base model GP-positive at ${fmt(referenceScenario.gpMonth2Real)}/month even without appeals or PCM.`
                  : 'margin still tight — appeals or PCM needed to reach positive GP.'}
              </p>
            </div>
          )}
        </section>

        {/* Per-code revenue breakdown */}
        {!referenceScenario.locked && referenceScenario.eligibleCodes.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">Code Revenue Breakdown <span className="normal-case font-normal text-slate-400">(PsychNP / MD / Psychiatrist unlock same advocacy codes)</span></h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Codes</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Service</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Monthly rev</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {referenceScenario.eligibleCodes.map((c) => (
                    <tr key={c.codes}>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600">{c.codes}</td>
                      <td className="px-5 py-3 text-slate-700">{c.name}</td>
                      <td className="px-5 py-3 text-right font-medium text-slate-800">{fmt(c.monthlyRev)}</td>
                      <td className="px-5 py-3">
                        {c.unconfirmed
                          ? <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">⚠️ unconfirmed</span>
                          : <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">confirmed</span>
                        }
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50">
                    <td colSpan={2} className="px-5 py-3 font-semibold text-slate-700">Total</td>
                    <td className="px-5 py-3 text-right font-bold text-slate-900">{fmt(referenceScenario.totalMonthlyRev)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Reference sections */}
        <OpenQuestions />

        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-700">Code Reference</p>
            <p className="text-sm text-slate-500 mt-0.5">Full definitions, patient criteria, unlock paths, and billing rules for all codes</p>
          </div>
          <Link href="/codes" className="text-sm font-medium text-blue-600 hover:underline shrink-0">View all codes →</Link>
        </div>

        {/* Data tools — de-emphasised */}
        <div className="border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">Data tools</p>
          <div className="flex gap-2">
            <Link
              href="/model"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              Portfolio builder
            </Link>
            <Link
              href="/patients"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              Patient tracker
            </Link>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center pb-4">
          Rates are 2025 CMS estimates. Rules marked ⚠️ are unconfirmed — validate with your MAC or billing counsel before relying on them.
          <br />Advocacy Billing Model · Mervin · {new Date().getFullYear()}
        </p>
      </main>
    </div>
  )
}
