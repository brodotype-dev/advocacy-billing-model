'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import ProfileForm, { profileLabel } from '@/components/ProfileForm'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { computePortfolioSummary } from '@/lib/aggregate'
import type { Cohort, PortfolioSnapshot } from '@/lib/types'
import type { PatientProfile } from '@/lib/eligibility'

const DEFAULT_PROFILE: PatientProfile = {
  therapistType: 'lcsw',
  conditions: 'multiple',
  sdoh: true,
  bhImpact: true,
  includeAppeals: false,
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function GPCell({ value }: { value: number }) {
  if (value > 0) return <span className="text-emerald-600 font-semibold">{fmt(value)}</span>
  if (value < -50) return <span className="text-red-500 font-semibold">{fmt(value)}</span>
  return <span className="text-amber-600 font-semibold">{fmt(value)}</span>
}

export default function ModelPage() {
  const [cohorts, setCohorts] = useLocalStorage<Cohort[]>('abm:portfolio:cohorts', [])
  const [snapshots, setSnapshots] = useLocalStorage<PortfolioSnapshot[]>('abm:portfolio:snapshots', [])

  // Add cohort form state
  const [addLabel, setAddLabel] = useState('')
  const [addCount, setAddCount] = useState(1)
  const [addProfile, setAddProfile] = useState<PatientProfile>(DEFAULT_PROFILE)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Snapshot state
  const [snapshotsOpen, setSnapshotsOpen] = useState(false)
  const [snapshotName, setSnapshotName] = useState('')

  const summary = cohorts.length > 0 ? computePortfolioSummary(cohorts) : null

  function addCohort() {
    if (!addLabel.trim() || addCount < 1) return
    const newCohort: Cohort = {
      id: crypto.randomUUID(),
      label: addLabel.trim(),
      patientCount: addCount,
      profile: addProfile,
    }
    setCohorts(prev => [...prev, newCohort])
    setAddLabel('')
    setAddCount(1)
    setAddProfile(DEFAULT_PROFILE)
  }

  function deleteCohort(id: string) {
    setCohorts(prev => prev.filter(c => c.id !== id))
  }

  function startEdit(cohort: Cohort) {
    setEditingId(cohort.id)
    setAddLabel(cohort.label)
    setAddCount(cohort.patientCount)
    setAddProfile(cohort.profile)
  }

  function saveEdit() {
    if (!editingId || !addLabel.trim() || addCount < 1) return
    setCohorts(prev =>
      prev.map(c =>
        c.id === editingId
          ? { ...c, label: addLabel.trim(), patientCount: addCount, profile: addProfile }
          : c
      )
    )
    setEditingId(null)
    setAddLabel('')
    setAddCount(1)
    setAddProfile(DEFAULT_PROFILE)
  }

  function cancelEdit() {
    setEditingId(null)
    setAddLabel('')
    setAddCount(1)
    setAddProfile(DEFAULT_PROFILE)
  }

  function saveSnapshot() {
    if (!snapshotName.trim()) return
    const snapshot: PortfolioSnapshot = {
      id: crypto.randomUUID(),
      name: snapshotName.trim(),
      savedAt: new Date().toISOString(),
      cohorts,
    }
    setSnapshots(prev => [...prev, snapshot])
    setSnapshotName('')
  }

  function loadSnapshot(snapshot: PortfolioSnapshot) {
    if (!confirm(`Load "${snapshot.name}"? This will replace your current cohorts.`)) return
    setCohorts(snapshot.cohorts)
  }

  function deleteSnapshot(id: string) {
    setSnapshots(prev => prev.filter(s => s.id !== id))
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ cohorts, exportedAt: new Date().toISOString() }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `advocacy-portfolio-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isEditing = editingId !== null

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Portfolio Modeler</h2>
            <p className="text-sm text-slate-500 mt-1">
              Build cohorts and project aggregate revenue across care team scenarios.
              {summary && (
                <> <span className="font-medium text-slate-700">{cohorts.length} cohort{cohorts.length !== 1 ? 's' : ''}</span> · <span className="font-medium text-slate-700">{summary.totalPatients} patients</span></>
              )}
            </p>
          </div>
          {cohorts.length > 0 && (
            <button
              onClick={exportJson}
              className="text-sm text-slate-600 border border-slate-200 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50"
            >
              Export JSON
            </button>
          )}
        </div>

        {/* Add / Edit cohort form */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {isEditing ? 'Edit Cohort' : 'Add Cohort'}
          </h3>

          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Label</p>
              <input
                type="text"
                value={addLabel}
                onChange={e => setAddLabel(e.target.value)}
                placeholder="e.g. LCSW high-acuity"
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 w-56 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Patient count</p>
              <input
                type="number"
                min={1}
                value={addCount}
                onChange={e => setAddCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 w-24 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          <ProfileForm profile={addProfile} onChange={setAddProfile} />

          <div className="flex gap-3 pt-1">
            {isEditing ? (
              <>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  Save changes
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-white text-slate-600 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={addCohort}
                disabled={!addLabel.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add cohort
              </button>
            )}
          </div>
        </section>

        {/* Cohort list */}
        {cohorts.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Cohorts</h3>
            {cohorts.map(cohort => {
              const scenarios = summary?.cohortSummaries.find(cs => cs.cohortId === cohort.id)?.scenarios ?? []
              const npScenario = scenarios.find(s => s.label === '+ PsychNP')
              return (
                <div key={cohort.id} className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-6">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{cohort.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{cohort.patientCount} patients · {profileLabel(cohort.profile)}</p>
                  </div>
                  {npScenario && !npScenario.locked && (
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-slate-800">{fmt(npScenario.totalMonthlyRev)}</p>
                      <p className="text-xs text-slate-400">mo rev (PsychNP)</p>
                    </div>
                  )}
                  {npScenario?.locked && (
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">Locked (LCSW, no unlock)</p>
                    </div>
                  )}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(cohort)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCohort(cohort.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </section>
        )}

        {/* Aggregate summary */}
        {summary && (
          <>
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">
                Aggregate Revenue by Scenario
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Scenario</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Monthly rev</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">GP mo 2+ (cap)</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">GP mo 2+ (real avg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.scenarioTotals.map(s => (
                      <tr key={s.label}>
                        <td className="px-5 py-3 font-medium text-slate-800">{s.label}</td>
                        <td className="px-5 py-3 text-right font-mono text-slate-700">{fmt(s.totalMonthlyRev)}</td>
                        <td className="px-5 py-3 text-right"><GPCell value={s.gpMonth2At500} /></td>
                        <td className="px-5 py-3 text-right"><GPCell value={s.gpMonth2Real} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Code breakdown */}
            {summary.codeBreakdown.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">
                  Code Breakdown <span className="normal-case font-normal text-slate-400">(PsychNP scenario)</span>
                </h3>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-left">
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Code</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Service</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Patients eligible</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Monthly rev</th>
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.codeBreakdown.map(c => (
                        <tr key={c.codes}>
                          <td className="px-5 py-3 font-mono text-xs text-slate-600">{c.codes}</td>
                          <td className="px-5 py-3 text-slate-700">{c.name}</td>
                          <td className="px-5 py-3 text-right text-slate-700">{c.patientsEligible}</td>
                          <td className="px-5 py-3 text-right font-medium text-slate-800">{fmt(c.totalMonthlyRev)}</td>
                          <td className="px-5 py-3">
                            {c.unconfirmed
                              ? <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">⚠️ unconfirmed</span>
                              : <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">confirmed</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}

        {/* Snapshots */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => setSnapshotsOpen(!snapshotsOpen)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-700">Saved Snapshots</span>
            <span className="text-slate-400 text-sm">{snapshotsOpen ? '▲ hide' : '▼ show'} ({snapshots.length})</span>
          </button>

          {snapshotsOpen && (
            <div className="border-t border-slate-100 px-5 py-4 space-y-4">
              {/* Save current */}
              {cohorts.length > 0 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={snapshotName}
                    onChange={e => setSnapshotName(e.target.value)}
                    placeholder="Snapshot name (e.g. Q2 hiring model)"
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <button
                    onClick={saveSnapshot}
                    disabled={!snapshotName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              )}

              {snapshots.length === 0 && (
                <p className="text-sm text-slate-400">No saved snapshots yet.</p>
              )}

              {snapshots.map(snap => (
                <div key={snap.id} className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{snap.name}</p>
                    <p className="text-xs text-slate-400">
                      {snap.cohorts.length} cohorts · {new Date(snap.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => loadSnapshot(snap)} className="text-xs text-blue-600 hover:underline">Load</button>
                    <button onClick={() => deleteSnapshot(snap.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="text-xs text-slate-400 text-center pb-4">
          Rates are 2025 CMS estimates. Rules marked ⚠️ are unconfirmed — validate with your MAC or billing counsel before relying on them.
          <br />Advocacy Billing Model · Mervin · {new Date().getFullYear()}
        </p>
      </main>
    </div>
  )
}
