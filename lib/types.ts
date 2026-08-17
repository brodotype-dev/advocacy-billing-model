import type { PatientProfile } from './eligibility'

export interface Cohort {
  id: string
  label: string
  patientCount: number
  profile: PatientProfile
}

export interface PortfolioSnapshot {
  id: string
  name: string
  savedAt: string
  cohorts: Cohort[]
}

export interface Patient {
  id: string
  displayName: string
  profile: PatientProfile
  notes?: string
  addedAt: string
}
