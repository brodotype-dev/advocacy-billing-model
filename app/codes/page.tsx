'use client'

import { useState } from 'react'
import { CODE_DEFINITIONS, CATEGORIES, type CodeCategory, type CodeDefinition } from '@/lib/codes'
import Nav from '@/components/Nav'

const CONFIDENCE_STYLE = {
  confirmed:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  likely:      'bg-blue-50 text-blue-700 border-blue-200',
  unconfirmed: 'bg-amber-50 text-amber-700 border-amber-200',
}

const CONFIDENCE_LABEL = {
  confirmed:   '✓ Confirmed',
  likely:      '~ Likely',
  unconfirmed: '⚠ Unconfirmed',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)
}

function CodeCard({ code }: { code: CodeDefinition }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="font-mono text-sm font-bold text-slate-700 shrink-0">{code.code}</span>
            <span className="text-slate-800 font-medium truncate">{code.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-slate-900">{fmt(code.rate2025)}</span>
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${CONFIDENCE_STYLE[code.confidence]}`}>
              {CONFIDENCE_LABEL[code.confidence]}
            </span>
            <span className="text-slate-400 text-sm">{expanded ? '▲' : '▼'}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-1 text-left">{code.fullName}</p>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-5 space-y-4 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Patient criteria" value={code.patientCriteria} />
            <Field label="Who can bill" value={code.whoCanBill} />
            <Field label="Who can supervise" value={code.whoCanSupervise} />
            <Field label="Unlock path" value={code.unlockPath} />
            <Field label="Time requirement" value={code.timeRequirement} />
            <Field label="Units per month" value={code.unitsPerMonth} />
          </div>

          {(code.stacksWith.length > 0 || code.mutuallyExclusive.length > 0) && (
            <div className="flex flex-wrap gap-4">
              {code.stacksWith.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Stacks with</p>
                  <div className="flex flex-wrap gap-1">
                    {code.stacksWith.map(c => (
                      <span key={c} className="text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {code.mutuallyExclusive.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Mutually exclusive with</p>
                  <div className="flex flex-wrap gap-1">
                    {code.mutuallyExclusive.map(c => (
                      <span key={c} className="text-xs font-mono bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {code.nuances.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Nuances & notes</p>
              <ul className="space-y-1">
                {code.nuances.map((n, i) => (
                  <li key={i} className="text-sm text-slate-700 flex gap-2">
                    <span className="text-slate-400 shrink-0 mt-0.5">•</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {code.confirmationNote && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-amber-700 mb-0.5">To validate</p>
              <p className="text-sm text-amber-700">{code.confirmationNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  )
}

export default function CodesPage() {
  const [activeCategory, setActiveCategory] = useState<CodeCategory | 'all'>('all')

  const filtered = activeCategory === 'all'
    ? CODE_DEFINITIONS
    : CODE_DEFINITIONS.filter(c => c.category === activeCategory)

  const unconfirmedCount = CODE_DEFINITIONS.filter(c => c.confidence === 'unconfirmed').length

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Billing Code Reference</h1>
            <p className="text-xs text-slate-500 mt-0.5">2025 CMS rates — National Non-Facility</p>
          </div>
          <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded">
            ⚠ {unconfirmedCount} codes with unconfirmed rules
          </span>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              activeCategory === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All ({CODE_DEFINITIONS.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = CODE_DEFINITIONS.filter(c => c.category === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  activeCategory === cat.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.id} ({count})
              </button>
            )
          })}
        </div>

        {/* Category description */}
        {activeCategory !== 'all' && (
          <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-sm font-medium text-slate-800">{CATEGORIES.find(c => c.id === activeCategory)?.label}</p>
            <p className="text-sm text-slate-500 mt-0.5">{CATEGORIES.find(c => c.id === activeCategory)?.description}</p>
          </div>
        )}

        {/* Code cards */}
        <div className="space-y-3">
          {filtered.map(code => <CodeCard key={code.code} code={code} />)}
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Confidence legend</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${CONFIDENCE_STYLE.confirmed}`}>{CONFIDENCE_LABEL.confirmed}</span>
              <span className="text-slate-600">Rule is documented in CMS guidance or verified with billing expert</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${CONFIDENCE_STYLE.likely}`}>{CONFIDENCE_LABEL.likely}</span>
              <span className="text-slate-600">Logical interpretation of CMS rules but not explicitly confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded border font-medium ${CONFIDENCE_STYLE.unconfirmed}`}>{CONFIDENCE_LABEL.unconfirmed}</span>
              <span className="text-slate-600">Needs MAC confirmation before relying on for billing</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center pb-4">
          Rates are 2025 CMS Physician Fee Schedule, National Non-Facility. Billing rules sourced from CMS MLN articles,
          transmittals, and expert interpretation. Not legal or compliance advice — validate with your MAC or billing counsel.
          <br />Advocacy Billing Model · Mervin · {new Date().getFullYear()}<br />Made by <a href="https://brodyclemmer.com/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 underline">Brody Clemmer</a>
        </p>
      </main>
    </div>
  )
}
