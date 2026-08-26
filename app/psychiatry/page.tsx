'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'

// ── Rates ─────────────────────────────────────────────────────────────────
// Source: 2025 CMS Physician Fee Schedule, National Non-Facility
// 99214, 99215, 90833 confirmed in lib/codes.ts
// 90792, 99213 are 2025 estimates — flagged as unconfirmed

const R = {
  em_low:       79,   // 99213 — established, low complexity (estimated)
  em_mod:       90,   // 99214 — established, moderate complexity (confirmed)
  em_high:     125,   // 99215 — established, high complexity (confirmed)
  eval_60:     271,   // 90792 — psychiatric diagnostic eval w/ medical services (estimated)
  addon_90833:  68,   // 90833 — psychotherapy add-on 16–37 min (confirmed)
}

// ── Types ─────────────────────────────────────────────────────────────────
type ProviderType = 'psychnp' | 'psychiatrist'
type EvalDuration = '60' | '90'

const PROVIDER_LABELS: Record<ProviderType, string> = {
  psychnp:      'PsychNP',
  psychiatrist: 'Psychiatrist (MD)',
}

// Provider hourly rate defaults (contract/part-time or locum rate)
const RATE_DEFAULTS: Record<ProviderType, number> = {
  psychnp:      100,
  psychiatrist: 250,
}

// Default total hours/month (patient + chart time)
// the consulting psychiatrist's model: 10 hrs/wk × 2 patient weeks + 10 hrs/wk × 2 chart weeks = 40 hrs/mo
const HOURS_DEFAULTS: Record<ProviderType, number> = {
  psychnp:      40,
  psychiatrist: 40,
}

// CoCM upside per enrolled patient/month (99493, ongoing)
// Psychiatrist-only unlock — out of scope for current phase
const COCM_MONTHLY_PER_PATIENT = 145

// ── Helpers ───────────────────────────────────────────────────────────────
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
  if (value > 0) return <span className="font-semibold text-emerald-600">{fmt(value)}</span>
  if (value < -5000) return <span className="font-semibold text-red-500">{fmt(value)}</span>
  return <span className="font-semibold text-amber-600">{fmt(value)}</span>
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────
export default function PsychiatryPage() {
  // Provider
  const [provider, setProvider] = useState<ProviderType>('psychnp')
  const [hourlyRate, setHourlyRate] = useState(RATE_DEFAULTS.psychnp)
  const [hoursPerMonth, setHoursPerMonth] = useState(HOURS_DEFAULTS.psychnp)

  // Capacity (the consulting psychiatrist's model defaults)
  const [hrsPerPatientWeek, setHrsPerPatientWeek] = useState(10)
  const [apptSlotMin, setApptSlotMin] = useState(30)
  const [patientWeeksPerMonth, setPatientWeeksPerMonth] = useState(2)

  // Session mix
  const [pctInitial, setPctInitial] = useState(20)
  const [evalDuration, setEvalDuration] = useState<EvalDuration>('60')
  const [includeAddon, setIncludeAddon] = useState(true)

  // Complexity mix (follow-ups) — pctHigh derived
  const [pctLow, setPctLow] = useState(30)
  const [pctMod, setPctMod] = useState(10)
  const safeMod = Math.min(pctMod, 100 - pctLow)
  const pctHigh = Math.max(0, 100 - pctLow - safeMod)

  // CoCM (Psychiatrist only)
  const [cocmPatients, setCocmPatients] = useState(0)

  // ── Derived: capacity ──────────────────────────────────────────────────
  const visitsPerPatientWeek = Math.floor((hrsPerPatientWeek * 60) / apptSlotMin)
  const visitsPerMonth = visitsPerPatientWeek * patientWeeksPerMonth
  const initialVisits = Math.round(visitsPerMonth * (pctInitial / 100))
  const followupVisits = visitsPerMonth - initialVisits

  // ── Derived: per-visit revenue ─────────────────────────────────────────
  const revenuePerEval = R.eval_60 + (evalDuration === '90' ? R.addon_90833 : 0)
  const addonRate = includeAddon ? R.addon_90833 : 0
  const revenuePerFollowup =
    (pctLow / 100)  * (R.em_low  + addonRate) +
    (safeMod / 100) * (R.em_mod  + addonRate) +
    (pctHigh / 100) * (R.em_high + addonRate)

  // ── Derived: monthly revenue ───────────────────────────────────────────
  const monthlyRevEval     = initialVisits * revenuePerEval
  const monthlyRevFollowup = followupVisits * revenuePerFollowup
  const monthlyRevCocm     = provider === 'psychiatrist' ? cocmPatients * COCM_MONTHLY_PER_PATIENT : 0
  const totalMonthlyRev    = monthlyRevEval + monthlyRevFollowup + monthlyRevCocm
  const avgRevenuePerVisit = visitsPerMonth > 0
    ? (monthlyRevEval + monthlyRevFollowup) / visitsPerMonth
    : 0

  // ── Derived: break-even ────────────────────────────────────────────────
  const monthlyComp             = hourlyRate * hoursPerMonth
  const annualComp              = monthlyComp * 12
  const monthlyMargin           = totalMonthlyRev - monthlyComp
  const annualMargin            = monthlyMargin * 12
  const annualRev               = totalMonthlyRev * 12
  const breakEvenVisitsPerMonth = avgRevenuePerVisit > 0
    ? Math.ceil(monthlyComp / avgRevenuePerVisit)
    : 0
  const capacitySurplus         = visitsPerMonth - breakEvenVisitsPerMonth

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">Psychiatry Model</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Revenue and break-even model for adding a psychiatric provider. Based on a consulting psychiatrist call (Mar 2026) —
            10 hrs/week patient care, 30 min slots, alternating patient/chart weeks.
          </p>
        </div>

        {/* ── Section 1: Provider ──────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Provider</h3>

          <div className="flex gap-2">
            {(['psychnp', 'psychiatrist'] as ProviderType[]).map(p => (
              <button
                key={p}
                onClick={() => {
                  setProvider(p)
                  setHourlyRate(RATE_DEFAULTS[p])
                  setHoursPerMonth(HOURS_DEFAULTS[p])
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  provider === p
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {PROVIDER_LABELS[p]}
              </button>
            ))}
          </div>

          {provider === 'psychnp' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
              <p className="text-xs text-orange-700">
                <span className="font-semibold">State supervision risk:</span> ~half of US states require physician
                oversight for NPs. In those states, you effectively need both a PsychNP and a supervising MD —
                confirm operating states before modeling PsychNP as the standalone option.
              </p>
            </div>
          )}

          {provider === 'psychiatrist' && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <p className="text-xs text-blue-700">
                <span className="font-semibold">CoCM unlock:</span> A Psychiatrist enables Collaborative Care Model
                billing (99492/99493) at scale — chart review only, no direct patient contact required.
                Modeled as add-on revenue below.
              </p>
            </div>
          )}

          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Hourly rate (contract / locum)</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">$</span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={e => setHourlyRate(parseInt(e.target.value) || 0)}
                  className="w-24 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-300"
                  step={5}
                />
                <span className="text-xs text-slate-400">/ hr</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Hours / month (patient + chart time)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={hoursPerMonth}
                  onChange={e => setHoursPerMonth(parseInt(e.target.value) || 0)}
                  className="w-24 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-300"
                  step={4}
                />
                <span className="text-xs text-slate-400">hrs/mo</span>
              </div>
            </div>
            <div className="text-sm text-slate-500 pt-4">
              = <span className="font-semibold text-slate-800">{fmt(monthlyComp)}/mo</span>
              <span className="text-xs text-slate-400 ml-1">({fmt(annualComp)}/yr equiv.)</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Hours/month covers both patient-facing time and chart/admin work. The consulting psychiatrist&apos;s model: 10 hrs/wk × 2 patient
            weeks + 10 hrs/wk × 2 chart weeks = 40 hrs/mo. To model two rotating providers, halve the hours each —
            cost stays the same.
          </p>
        </section>

        {/* ── Section 2: Capacity ──────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Capacity Model</h3>
            <p className="text-xs text-slate-400 mt-1">
              Based on the consulting psychiatrist&apos;s model: provider alternates between a patient week and a chart week.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Hours / patient week</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={4} max={40}
                  value={hrsPerPatientWeek}
                  onChange={e => setHrsPerPatientWeek(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="font-bold text-slate-900 w-10 text-right">{hrsPerPatientWeek}h</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Appointment slot (incl. documentation)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={15} max={90} step={15}
                  value={apptSlotMin}
                  onChange={e => setApptSlotMin(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="font-bold text-slate-900 w-12 text-right">{apptSlotMin} min</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Patient weeks / month</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={1} max={4}
                  value={patientWeeksPerMonth}
                  onChange={e => setPatientWeeksPerMonth(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="font-bold text-slate-900 w-6 text-right">{patientWeeksPerMonth}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {patientWeeksPerMonth === 2
                  ? 'Consulting psychiatrist model: alternating patient / chart weeks'
                  : patientWeeksPerMonth === 4
                  ? 'Full patient schedule'
                  : `${patientWeeksPerMonth} patient week${patientWeeksPerMonth > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg px-5 py-3 flex gap-8 flex-wrap text-sm">
            <div>
              <span className="text-slate-500">Visits / patient week</span>
              <span className="ml-2 font-bold text-slate-900">{visitsPerPatientWeek}</span>
            </div>
            <div>
              <span className="text-slate-500">Visits / month</span>
              <span className="ml-2 font-bold text-slate-900">{visitsPerMonth}</span>
            </div>
            <div>
              <span className="text-slate-500">Visits / year</span>
              <span className="ml-2 font-bold text-slate-900">{visitsPerMonth * 12}</span>
            </div>
          </div>
        </section>

        {/* ── Section 3: Session Mix ───────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Session Mix</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  % of visits = initial evaluations (90792)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={0} max={100} step={5}
                    value={pctInitial}
                    onChange={e => setPctInitial(parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="font-bold text-slate-900 w-10 text-right">{pctInitial}%</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {initialVisits} initial · {followupVisits} follow-up / month
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Initial eval duration
                </label>
                <div className="flex gap-2">
                  {(['60', '90'] as EvalDuration[]).map(d => (
                    <button
                      key={d}
                      onClick={() => setEvalDuration(d)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        evalDuration === d
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {evalDuration === '60'
                    ? `90792 only → ${fmt(R.eval_60)}/visit (estimated)`
                    : `90792 + 90833 add-on → ${fmt(R.eval_60 + R.addon_90833)}/visit (estimated)`}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-600">
                  Include 90833 psychotherapy add-on on follow-ups?
                </label>
                <button
                  onClick={() => setIncludeAddon(!includeAddon)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    includeAddon
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {includeAddon ? 'Yes (+$68/visit)' : 'No'}
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Only bill 90833 when psychotherapy is actually provided in the session.
              </p>

              <div className="mt-4 bg-slate-50 rounded-lg px-4 py-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Per initial eval</span>
                  <span className="font-medium text-slate-800">{fmt(revenuePerEval)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Per follow-up (blended)</span>
                  <span className="font-medium text-slate-800">{fmtDec(revenuePerFollowup)}</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between">
                  <span className="font-medium text-slate-600">Avg / visit (all)</span>
                  <span className="font-semibold text-slate-900">{fmtDec(avgRevenuePerVisit)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4: Complexity Mix ────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Complexity Mix — Follow-ups</h3>
            <p className="text-xs text-slate-400 mt-1">
              Pre-filled with the clinical lead&apos;s estimate for the provider&apos;s senior population. High complexity reflects
              polypharmacy and multi-diagnosis patients.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Low (99213)</label>
                <span className="font-mono text-sm font-bold text-slate-700">{pctLow}%</span>
              </div>
              <input
                type="range" min={0} max={100}
                value={pctLow}
                onChange={e => setPctLow(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
              <p className="text-xs text-slate-400 mt-1">{fmt(R.em_low + addonRate)}/visit</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">Moderate (99214)</label>
                <span className="font-mono text-sm font-bold text-slate-700">{safeMod}%</span>
              </div>
              <input
                type="range" min={0} max={Math.max(0, 100 - pctLow)}
                value={safeMod}
                onChange={e => setPctMod(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
              <p className="text-xs text-slate-400 mt-1">{fmt(R.em_mod + addonRate)}/visit</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-600">High (99215)</label>
                <span className="font-mono text-sm font-bold text-slate-700">{pctHigh}%</span>
              </div>
              <div className="h-5 flex items-center">
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${pctHigh}%` }} />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">Derived · {fmt(R.em_high + addonRate)}/visit</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-2 text-xs text-amber-700">
            High complexity (99215): polypharmacy, multiple psychiatric diagnoses, cognitive impairment, crisis risk.
            Highest audit risk — document medical decision-making rigorously.
          </div>
        </section>

        {/* ── Section 5: CoCM (Psychiatrist only) ─────────────────────── */}
        {provider === 'psychiatrist' && (
          <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                CoCM Add-on Revenue — Psychiatrist Only
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Psychiatrist can serve as the psychiatric consultant in a Collaborative Care Model program.
                Chart review only — no direct patient contact required. Billed monthly per enrolled patient
                (99493 ongoing). Out of scope for current phase; modeled as future upside.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-slate-600 whitespace-nowrap">Enrolled CoCM patients:</label>
              <input
                type="range" min={0} max={200} step={10}
                value={cocmPatients}
                onChange={e => setCocmPatients(parseInt(e.target.value))}
                className="w-48 accent-blue-600"
              />
              <span className="font-bold text-slate-900 w-10">{cocmPatients}</span>
              <span className="text-xs text-slate-400">
                → {fmt(monthlyRevCocm)}/mo ({fmt(COCM_MONTHLY_PER_PATIENT)}/pt at 99493)
              </span>
            </div>
          </section>
        )}

        {/* ── Section 6: Revenue Output ────────────────────────────────── */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Revenue Model</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Visits / month"
              value={String(visitsPerMonth)}
              sub={`${initialVisits} evals · ${followupVisits} follow-ups`}
            />
            <StatCard
              label="Avg revenue / visit"
              value={fmtDec(avgRevenuePerVisit)}
              sub="blended eval + follow-up"
            />
            <StatCard
              label="Monthly revenue"
              value={fmt(totalMonthlyRev)}
              sub={monthlyRevCocm > 0 ? `incl. ${fmt(monthlyRevCocm)} CoCM` : 'E&M only'}
            />
            <StatCard label="Annual run rate" value={fmt(annualRev)} sub="at current capacity" />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Line item</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Codes</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Visits</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Rate</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Monthly rev</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-5 py-3 text-slate-700">Initial eval ({evalDuration} min)</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">
                    {evalDuration === '90' ? '90792 + 90833' : '90792'}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-slate-700">{initialVisits}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{fmt(revenuePerEval)}</td>
                  <td className="px-5 py-3 text-right font-medium text-slate-800">{fmt(monthlyRevEval)}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      90792 estimated
                    </span>
                  </td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="px-5 py-3 text-slate-700">
                    Follow-up{includeAddon ? ' + 90833' : ''}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">
                    {includeAddon ? '99213–99215 + 90833' : '99213–99215'}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-slate-700">{followupVisits}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{fmtDec(revenuePerFollowup)}</td>
                  <td className="px-5 py-3 text-right font-medium text-slate-800">{fmt(monthlyRevFollowup)}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      confirmed
                    </span>
                  </td>
                </tr>
                {provider === 'psychiatrist' && cocmPatients > 0 && (
                  <tr>
                    <td className="px-5 py-3 text-slate-700">CoCM ({cocmPatients} enrolled pts)</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">99493</td>
                    <td className="px-5 py-3 text-right font-mono text-slate-700">—</td>
                    <td className="px-5 py-3 text-right text-slate-700">{fmt(COCM_MONTHLY_PER_PATIENT)}/pt</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-800">{fmt(monthlyRevCocm)}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        confirmed
                      </span>
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-50 font-semibold">
                  <td colSpan={4} className="px-5 py-3 text-slate-700">Total monthly revenue</td>
                  <td className="px-5 py-3 text-right text-slate-900">{fmt(totalMonthlyRev)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Section 7: Break-Even ────────────────────────────────────── */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Break-Even Analysis</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Monthly P&L</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Revenue</span>
                  <span className="font-medium text-slate-800">{fmt(totalMonthlyRev)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Provider cost</span>
                  <span className="font-medium text-slate-800">−{fmt(monthlyComp)}</span>
                </div>
                <div className="border-t border-slate-100 pt-1.5 flex justify-between">
                  <span className="font-medium text-slate-600">Monthly margin</span>
                  <MarginBadge value={monthlyMargin} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Annual margin</span>
                  <MarginBadge value={annualMargin} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Visit break-even</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current capacity</span>
                  <span className="font-medium text-slate-800">{visitsPerMonth} visits/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Break-even visits</span>
                  <span className={`font-medium ${breakEvenVisitsPerMonth <= visitsPerMonth ? 'text-emerald-600' : 'text-red-500'}`}>
                    {breakEvenVisitsPerMonth} visits/mo
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-1.5 flex justify-between">
                  <span className="font-medium text-slate-600">
                    {capacitySurplus >= 0 ? 'Surplus' : 'Shortfall'}
                  </span>
                  <span className={`font-semibold ${capacitySurplus >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {Math.abs(capacitySurplus)} visits/mo
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Annual view</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Annual revenue</span>
                  <span className="font-medium text-slate-800">{fmt(annualRev)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Annual cost</span>
                  <span className="font-medium text-slate-800">−{fmt(annualComp)}</span>
                </div>
                <div className="border-t border-slate-100 pt-1.5 flex justify-between">
                  <span className="font-medium text-slate-600">Revenue covers cost?</span>
                  <span className={`font-semibold ${annualRev >= annualComp ? 'text-emerald-600' : 'text-red-500'}`}>
                    {annualRev >= annualComp
                      ? `Yes — ${Math.round((annualRev / annualComp - 1) * 100)}% above`
                      : `No — ${fmt(annualComp - annualRev)} gap`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {monthlyMargin < 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-700 mb-1">What this means</p>
              <p>
                At {visitsPerMonth} visits/month and {fmt(avgRevenuePerVisit)}/visit avg, this provider generates{' '}
                {fmt(totalMonthlyRev)}/month — {fmt(Math.abs(monthlyMargin))} short of covering cost.
                To break even, you need{' '}
                <span className="font-semibold text-slate-900">{breakEvenVisitsPerMonth} visits/month</span> — that&apos;s{' '}
                {Math.ceil(breakEvenVisitsPerMonth / (hrsPerPatientWeek * 60 / apptSlotMin))} patient weeks/month
                at the current slot size.
              </p>
            </div>
          )}

          {monthlyMargin >= 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 text-sm text-emerald-800">
              This provider is margin-positive at current capacity — generating{' '}
              <span className="font-semibold">{fmt(monthlyMargin)}/month</span> above cost.
              {provider === 'psychiatrist' && cocmPatients === 0 && (
                <span> Add CoCM enrolled patients above to model additional upside.</span>
              )}
            </div>
          )}
        </section>

        {/* ── Open Questions ───────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-100">
            <p className="font-semibold text-amber-700">Open Questions — Psychiatry Model</p>
            <p className="text-xs text-slate-400 mt-0.5">From consulting psychiatrist call, Mar 2026</p>
          </div>
          <div className="divide-y divide-amber-50">
            {[
              { q: 'Med management only, or full psychiatry with therapy?', why: 'Determines whether 90833 is billable and whether you need a prescriber vs. a full psychiatric evaluator.' },
              { q: 'Are the 30-min follow-ups med management, therapy, or both?', why: 'Changes CPT code selection — 90833 only billable if psychotherapy is actually delivered.' },
              { q: 'In-person, telehealth, or hybrid?', why: 'Medicare telehealth rules affect eligible codes and rates.' },
              { q: 'Traditional Medicare or Medicare Advantage?', why: 'MA plans set their own rates — could differ materially from CMS national non-facility.' },
              { q: 'PsychNP supervision requirements in operating states?', why: '~half of states require physician oversight for NPs, which changes the cost model.' },
              { q: 'At what patient volume does full psychiatry become superfluous?', why: 'The consulting psychiatrist used this word — worth defining the threshold explicitly so the model has a clear decision point.' },
              { q: 'Confirm 90792 rate with MAC or billing counsel.', why: '90792 is estimated in this model — not pulled from the confirmed 2025 PFS.' },
            ].map((item, i) => (
              <div key={i} className="px-5 py-3">
                <p className="font-medium text-slate-800 text-sm">{i + 1}. {item.q}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.why}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-xs text-slate-400 text-center pb-4">
          90792 rate is a 2025 CMS estimate — validate before billing. All other rates from confirmed 2025 PFS (lib/codes.ts).
          <br />Advocacy Billing Model · Mervin · {new Date().getFullYear()}<br />Made by <a href="https://brodyclemmer.com/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 underline">Brody Clemmer</a>
        </p>
      </main>
    </div>
  )
}
