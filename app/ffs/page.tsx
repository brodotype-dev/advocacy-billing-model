'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import ProfileForm from '@/components/ProfileForm'
import { getScenarios, type PatientProfile } from '@/lib/eligibility'

const DEFAULT_PROFILE: PatientProfile = {
  therapistType: 'lcsw',
  conditions: 'multiple',
  sdoh: true,
  bhImpact: true,
  includeAppeals: false, // not used in this model — add-on units are set directly
}

const ADVOCATE_RATE = 40 / 60 // $40/hr → $/min

// Minutes per code given add-on units
// Codes bill for both patient-facing and non-patient-facing time
function getCodeMinutes(codeName: string, addOnUnits: number): number {
  if (['PIN', 'CHI', 'PIN-PS'].includes(codeName)) return 60 + 30 * addOnUnits
  if (codeName === 'BHI') return 20
  if (codeName === 'PCM') return 60 // 99426 (30) + 99427 (30)
  return 0
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function fmtDec(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

function MarginBadge({ value }: { value: number }) {
  if (value > 0) return <span className="text-emerald-600 font-semibold">{fmt(value)}</span>
  if (value < -20) return <span className="text-red-500 font-semibold">{fmt(value)}</span>
  return <span className="text-amber-600 font-semibold">{fmt(value)}</span>
}

function RatePerMin({ value }: { value: number }) {
  // $40/hr = $0.667/min is break-even
  const color = value >= 0.667 ? 'text-emerald-600' : 'text-red-500'
  return <span className={`font-mono font-semibold ${color}`}>${value.toFixed(2)}/min</span>
}

export default function FFSPage() {
  const [profile, setProfile] = useState<PatientProfile>(DEFAULT_PROFILE)
  const [addOnUnits, setAddOnUnits] = useState(1)
  const [emConversionRate, setEmConversionRate] = useState(100)

  // Use PsychNP scenario as the reference for max eligible codes
  // (we override add-on units separately — profile.includeAppeals doesn't matter here)
  const profileWithUnits: PatientProfile = { ...profile, includeAppeals: addOnUnits >= 2 }
  const scenarios = getScenarios(profileWithUnits)
  const npScenario = scenarios.find(s => s.label === '+ PsychNP')!
  const needsUnlock = profile.therapistType === 'lcsw'

  // Rebuild per-code economics with custom add-on units
  // We use the eligible codes from the scenario but recompute revenue for custom units
  const R = {
    PIN_60: 79.24, PIN_30: 49.44,
    CHI_60: 79.24, CHI_30: 49.44,
    PPS_60: 79.24, PPS_30: 49.44,
    BHI: 57.45,
    PCM_1: 67.80, PCM_2: 54.11,
  }

  interface CodeRow {
    codes: string
    name: string
    minutes: number
    revenue: number
    advocateCost: number
    margin: number
    perMin: number
    unconfirmed: boolean
    warning?: string
  }

  function buildCodeRows(): CodeRow[] {
    if (npScenario.locked) return []

    const rows: CodeRow[] = []
    const canBillPINPS = profile.conditions === 'multiple' && profile.bhImpact

    if (canBillPINPS) {
      const rev = R.PPS_60 + R.PPS_30 * addOnUnits
      const mins = 60 + 30 * addOnUnits
      const cost = mins * ADVOCATE_RATE
      rows.push({ codes: 'G0140 + G0146', name: 'PIN-PS', minutes: mins, revenue: rev, advocateCost: cost, margin: rev - cost, perMin: rev / mins, unconfirmed: profile.therapistType === 'psychologist', warning: profile.therapistType === 'psychologist' ? 'Psychologist 90791 → PIN-PS unlock unconfirmed' : undefined })
    } else {
      const rev = R.PIN_60 + R.PIN_30 * addOnUnits
      const mins = 60 + 30 * addOnUnits
      const cost = mins * ADVOCATE_RATE
      rows.push({ codes: 'G0023 + G0024', name: 'PIN', minutes: mins, revenue: rev, advocateCost: cost, margin: rev - cost, perMin: rev / mins, unconfirmed: false })
    }

    if (profile.sdoh) {
      const rev = R.CHI_60 + R.CHI_30 * addOnUnits
      const mins = 60 + 30 * addOnUnits
      const cost = mins * ADVOCATE_RATE
      rows.push({ codes: 'G0019 + G0022', name: 'CHI', minutes: mins, revenue: rev, advocateCost: cost, margin: rev - cost, perMin: rev / mins, unconfirmed: profile.therapistType === 'psychologist', warning: profile.therapistType === 'psychologist' ? 'Psychologist 90791 → CHI unlock unconfirmed' : undefined })
    }

    // BHI
    {
      const rev = R.BHI
      const mins = 20
      const cost = mins * ADVOCATE_RATE
      rows.push({ codes: '99484', name: 'BHI', minutes: mins, revenue: rev, advocateCost: cost, margin: rev - cost, perMin: rev / mins, unconfirmed: true, warning: 'Monthly vs episodic billing unconfirmed' })
    }

    if (profile.conditions === 'one') {
      const rev = R.PCM_1 + R.PCM_2
      const mins = 60
      const cost = mins * ADVOCATE_RATE
      rows.push({ codes: '99426 + 99427', name: 'PCM', minutes: mins, revenue: rev, advocateCost: cost, margin: rev - cost, perMin: rev / mins, unconfirmed: true, warning: 'PCM + G code stacking in same month unconfirmed' })
    }

    return rows
  }

  const codeRows = buildCodeRows()
  const totalMinutes = codeRows.reduce((s, r) => s + r.minutes, 0)
  const totalRevenue = codeRows.reduce((s, r) => s + r.revenue, 0)
  const totalCost = codeRows.reduce((s, r) => s + r.advocateCost, 0)
  const totalMargin = totalRevenue - totalCost
  const blendedPerMin = totalMinutes > 0 ? totalRevenue / totalMinutes : 0

  // E&M conversion risk (month 1 only, LCSW)
  const EM_COST = 37 // PsychNP unlock
  const conversionFactor = emConversionRate / 100
  const expectedMonth1Margin = totalMargin * conversionFactor - EM_COST

  // Utilization scenarios
  const utilizationLevels = [
    { label: '100%', pct: 1.0, note: 'Full billable ceiling' },
    { label: '76%', pct: 0.76, note: '≈ 380 min avg (advocate benchmark)' },
    { label: '60%', pct: 0.60, note: 'Conservative floor' },
  ]

  const advocateAvgMinutes = 380

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Page header */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">Fee-for-Service Model</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            In this model, advocate time = billed time. Cost and revenue are tethered — the advocate only works when there's a code to bill.
            Codes count both patient-facing and non-patient-facing time.
          </p>
        </div>

        {/* Patient profile */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Patient Profile</h3>
          <ProfileForm profile={profile} onChange={p => setProfile({ ...p, includeAppeals: false })} />
        </section>

        {/* Add-on units input */}
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between gap-8 flex-wrap">
            <div className="flex-1 min-w-[260px]">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-1">Add-on units per code</h3>
              <p className="text-xs text-slate-400 mb-4">
                Each unit = 30 min billed per G code family. Per CMS CY 2024 PFS Final Rule and HRSN FAQ, there is <span className="font-medium text-slate-600">no hard cap</span> on add-on units — traditional Medicare imposes no frequency limit. Billing additional units requires documented medical necessity and time records; no prior auth needed for fee-for-service Medicare. MA plans may impose their own limits.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={addOnUnits}
                  onChange={e => setAddOnUnits(parseInt(e.target.value))}
                  className="w-48 accent-blue-600"
                />
                <span className="text-2xl font-bold text-slate-900 w-8">{addOnUnits}</span>
                <span className="text-sm text-slate-500">unit{addOnUnits !== 1 ? 's' : ''} per code</span>
              </div>
            </div>

            <div className="flex gap-6 shrink-0">
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">{totalMinutes}</p>
                <p className="text-xs text-slate-500 mt-0.5">total billable min</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${totalMinutes <= advocateAvgMinutes ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {totalMinutes <= advocateAvgMinutes ? '≤ avg' : `+${totalMinutes - advocateAvgMinutes} min`}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">vs. advocate avg ({advocateAvgMinutes} min)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Locked state */}
        {npScenario.locked && (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center">
            <p className="text-slate-500">No codes unlock for this profile without a provider. Add a PsychNP, MD, or Psychiatrist — or switch to Psychologist therapist type.</p>
          </div>
        )}

        {/* Per-code economics table */}
        {codeRows.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">
              Per-Code Economics
              <span className="normal-case font-normal text-slate-400 ml-2">Advocate rate: $40/hr · Break-even: $0.67/min</span>
            </h3>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Code</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Minutes</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Revenue</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Advocate cost</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Margin</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">$/min</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {codeRows.map(row => (
                    <tr key={row.codes}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">{row.name}</p>
                        <p className="font-mono text-xs text-slate-400">{row.codes}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-slate-700">{row.minutes}</td>
                      <td className="px-5 py-3 text-right text-slate-700">{fmt(row.revenue)}</td>
                      <td className="px-5 py-3 text-right text-slate-500">−{fmt(row.advocateCost)}</td>
                      <td className="px-5 py-3 text-right"><MarginBadge value={row.margin} /></td>
                      <td className="px-5 py-3 text-right"><RatePerMin value={row.perMin} /></td>
                      <td className="px-5 py-3 text-right">
                        {row.unconfirmed
                          ? <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">⚠️ unconfirmed</span>
                          : <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">confirmed</span>
                        }
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-semibold">
                    <td className="px-5 py-3 text-slate-700">Total</td>
                    <td className="px-5 py-3 text-right font-mono text-slate-800">{totalMinutes}</td>
                    <td className="px-5 py-3 text-right text-slate-800">{fmt(totalRevenue)}</td>
                    <td className="px-5 py-3 text-right text-slate-500">−{fmt(totalCost)}</td>
                    <td className="px-5 py-3 text-right"><MarginBadge value={totalMargin} /></td>
                    <td className="px-5 py-3 text-right"><RatePerMin value={blendedPerMin} /></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Utilization scenarios */}
        {codeRows.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">
              Utilization Scenarios
              <span className="normal-case font-normal text-slate-400 ml-2">What if you don't bill the full ceiling?</span>
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {utilizationLevels.map(u => {
                const mins = Math.round(totalMinutes * u.pct)
                const rev = totalRevenue * u.pct
                const cost = mins * ADVOCATE_RATE
                const margin = rev - cost
                return (
                  <div key={u.label} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{u.label}</p>
                      <p className="text-xs text-slate-400">{u.note}</p>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Minutes billed</span>
                        <span className="font-mono text-slate-700">{mins}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Revenue</span>
                        <span className="text-slate-700">{fmt(rev)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Advocate cost</span>
                        <span className="text-slate-500">−{fmt(cost)}</span>
                      </div>
                      <div className="border-t border-slate-100 pt-1.5 flex justify-between">
                        <span className="font-medium text-slate-600">Margin</span>
                        <MarginBadge value={margin} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* E&M conversion risk — LCSW only */}
        {codeRows.length > 0 && needsUnlock && (
          <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">E&M Conversion Risk — Month 1</h3>
              <p className="text-xs text-slate-400 mt-1">
                LCSW patients need a provider E&M visit to unlock billing. If some of those visits don't result in billable codes,
                what does expected month 1 margin look like?
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm text-slate-600 whitespace-nowrap">Conversion rate:</label>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={emConversionRate}
                onChange={e => setEmConversionRate(parseInt(e.target.value))}
                className="w-48 accent-blue-600"
              />
              <span className="text-lg font-bold text-slate-900 w-12">{emConversionRate}%</span>
              <span className="text-xs text-slate-400">of E&M visits result in billable advocacy codes</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-50 rounded-lg px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">E&M cost (per patient, mo 1)</p>
                <p className="font-semibold text-slate-800">−{fmt(EM_COST)}</p>
                <p className="text-xs text-slate-400 mt-0.5">PsychNP at $110/hr × 20 min</p>
              </div>
              <div className="bg-slate-50 rounded-lg px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Expected advocacy margin</p>
                <p className="font-semibold text-slate-800">{fmt(totalMargin)} × {emConversionRate}% = {fmt(totalMargin * conversionFactor)}</p>
                <p className="text-xs text-slate-400 mt-0.5">probability-weighted advocacy margin</p>
              </div>
              <div className="bg-slate-50 rounded-lg px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Expected month 1 margin</p>
                <MarginBadge value={expectedMonth1Margin} />
                <p className="text-xs text-slate-400 mt-0.5">(advocacy × rate) − E&M cost</p>
              </div>
            </div>

            {emConversionRate < 100 && (
              <p className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2">
                At {emConversionRate}% conversion, you need {fmtDec(EM_COST / (totalMargin * conversionFactor) * 100)}% of month 2+ margin recouped over {Math.ceil(EM_COST / (totalMargin * conversionFactor))} month(s) to break even on the unlock cost.
                {' '}This assumes patients who don't convert still need a separate pathway to qualify.
              </p>
            )}
          </section>
        )}

        <p className="text-xs text-slate-400 text-center pb-4">
          Rates are 2025 CMS estimates. Rules marked ⚠️ are unconfirmed — validate with your MAC or billing counsel.
          <br />Advocacy Billing Model · Mervin · {new Date().getFullYear()}
        </p>
      </main>
    </div>
  )
}
