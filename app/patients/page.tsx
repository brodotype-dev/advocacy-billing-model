'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import ProfileForm, { profileLabel } from '@/components/ProfileForm'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { computeDashboardSummary } from '@/lib/aggregate'
import { getScenarios } from '@/lib/eligibility'
import type { Patient } from '@/lib/types'
import type { PatientProfile, CareTeamScenario } from '@/lib/eligibility'

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

function GPBadge({ value }: { value: number }) {
  if (value > 0) return <span className="text-emerald-600 font-semibold">{fmt(value)}</span>
  if (value < -50) return <span className="text-red-500 font-semibold">{fmt(value)}</span>
  return <span className="text-amber-600 font-semibold">{fmt(value)}</span>
}

function PatientRow({
  patient,
  onDelete,
  onEdit,
}: {
  patient: Patient
  onDelete: () => void
  onEdit: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const scenarios = getScenarios(patient.profile)
  const todayScenario = scenarios.find(s => s.label === 'Today')!
  const npScenario = scenarios.find(s => s.label === '+ PsychNP')!

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900">{patient.displayName}</p>
            {todayScenario.locked && (
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Locked</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{profileLabel(patient.profile)}</p>
          {patient.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{patient.notes}</p>}
        </div>

        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-slate-800">
            {todayScenario.locked ? '—' : fmt(todayScenario.totalMonthlyRev)}
          </p>
          <p className="text-xs text-slate-400">today</p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-slate-800">
            {fmt(npScenario.totalMonthlyRev)}
          </p>
          <p className="text-xs text-slate-400">w/ PsychNP</p>
        </div>

        <div className="flex gap-2 shrink-0 items-center">
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-slate-400 hover:text-slate-700">
            {expanded ? '▲' : '▼'}
          </button>
          <button onClick={onEdit} className="text-xs text-blue-600 hover:underline">Edit</button>
          <button onClick={onDelete} className="text-xs text-red-500 hover:underline">Delete</button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {scenarios.map(s => (
              <ScenarioMini key={s.label} scenario={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ScenarioMini({ scenario }: { scenario: CareTeamScenario }) {
  if (scenario.locked) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center">
        <p className="text-sm font-medium text-slate-500">{scenario.label}</p>
        <p className="text-xs text-slate-400 mt-2">No unlock path</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4 space-y-2">
      <p className="text-sm font-semibold text-slate-700">{scenario.label}</p>
      <div className="flex flex-wrap gap-1">
        {scenario.eligibleCodes.map(c => (
          <span
            key={c.codes}
            className={`text-xs px-1.5 py-0.5 rounded font-mono ${
              c.unconfirmed
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {c.name}
          </span>
        ))}
      </div>
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-500">Revenue</span>
          <span className="font-medium text-slate-800">{fmt(scenario.totalMonthlyRev)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">GP mo 2+ (real)</span>
          <GPBadge value={scenario.gpMonth2Real} />
        </div>
      </div>
    </div>
  )
}

export default function PatientsPage() {
  const [patients, setPatients] = useLocalStorage<Patient[]>('abm:patients', [])

  // Form state
  const [addName, setAddName] = useState('')
  const [addNotes, setAddNotes] = useState('')
  const [addProfile, setAddProfile] = useState<PatientProfile>(DEFAULT_PROFILE)
  const [editingId, setEditingId] = useState<string | null>(null)

  const summary = patients.length > 0 ? computeDashboardSummary(patients) : null
  const isEditing = editingId !== null

  function addPatient() {
    if (!addName.trim()) return
    const newPatient: Patient = {
      id: crypto.randomUUID(),
      displayName: addName.trim(),
      profile: addProfile,
      notes: addNotes.trim() || undefined,
      addedAt: new Date().toISOString(),
    }
    setPatients(prev => [...prev, newPatient])
    resetForm()
  }

  function saveEdit() {
    if (!editingId || !addName.trim()) return
    setPatients(prev =>
      prev.map(p =>
        p.id === editingId
          ? { ...p, displayName: addName.trim(), profile: addProfile, notes: addNotes.trim() || undefined }
          : p
      )
    )
    setEditingId(null)
    resetForm()
  }

  function startEdit(patient: Patient) {
    setEditingId(patient.id)
    setAddName(patient.displayName)
    setAddNotes(patient.notes ?? '')
    setAddProfile(patient.profile)
  }

  function deletePatient(id: string) {
    setPatients(prev => prev.filter(p => p.id !== id))
  }

  function resetForm() {
    setAddName('')
    setAddNotes('')
    setAddProfile(DEFAULT_PROFILE)
  }

  function cancelEdit() {
    setEditingId(null)
    resetForm()
  }

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Page header */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">Patient Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track individual patients and identify billing gaps. Data persists in your browser.
          </p>
        </div>

        {/* Aggregate summary */}
        {summary && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
              <p className="text-2xl font-bold text-slate-900">{summary.totalPatients}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total patients</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
              <p className="text-2xl font-bold text-slate-900">{fmt(summary.totalRevToday)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Monthly rev today</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
              <p className="text-2xl font-bold text-slate-900">{fmt(summary.totalRevIfPsychNP)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Monthly rev w/ PsychNP</p>
            </div>
            <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
              <p className="text-2xl font-bold text-emerald-700">{fmt(summary.opportunityGap)}</p>
              <p className="text-xs text-emerald-600 mt-0.5">Opportunity gap / mo</p>
            </div>
          </section>
        )}

        {/* Locked alert */}
        {summary && summary.lockedPatients > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-3">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">{summary.lockedPatients} patient{summary.lockedPatients !== 1 ? 's' : ''} locked</span> — LCSW patients with no E&M unlock. Hiring a PsychNP, MD, or Psychiatrist would unlock billing for these patients.
            </p>
          </div>
        )}

        {/* Add / Edit patient form */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {isEditing ? 'Edit Patient' : 'Add Patient'}
          </h3>

          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Name / ID</p>
              <input
                type="text"
                value={addName}
                onChange={e => setAddName(e.target.value)}
                placeholder="e.g. Patient 1, Lorein F."
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 w-56 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Notes (optional)</p>
              <input
                type="text"
                value={addNotes}
                onChange={e => setAddNotes(e.target.value)}
                placeholder="Internal note — doesn't affect calculations"
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 w-80 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                onClick={addPatient}
                disabled={!addName.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add patient
              </button>
            )}
          </div>
        </section>

        {/* Patient list */}
        {patients.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            No patients yet. Add one above.
          </div>
        )}

        {patients.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Patients</h3>
              <p className="text-xs text-slate-400">Click ▼ on a row to see all 4 scenarios</p>
            </div>

            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] px-5 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide gap-4">
              <span>Patient</span>
              <span className="text-right w-24">Today</span>
              <span className="text-right w-28">w/ PsychNP</span>
              <span className="w-24"></span>
            </div>

            {patients.map(patient => (
              <PatientRow
                key={patient.id}
                patient={patient}
                onDelete={() => deletePatient(patient.id)}
                onEdit={() => startEdit(patient)}
              />
            ))}
          </section>
        )}

        <p className="text-xs text-slate-400 text-center pb-4">
          Patient data stored in browser localStorage — not synced or shared. Rates are 2025 CMS estimates.
          <br />Advocacy Billing Model · Mervin · {new Date().getFullYear()}
        </p>
      </main>
    </div>
  )
}
