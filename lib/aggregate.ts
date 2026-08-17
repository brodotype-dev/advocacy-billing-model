import { getScenarios } from './eligibility'
import type { Cohort, Patient } from './types'

export interface CohortSummary {
  cohortId: string
  label: string
  patientCount: number
  scenarios: {
    label: string
    totalMonthlyRev: number
    gpMonth1At500: number
    gpMonth2At500: number
    gpMonth2Real: number
    locked: boolean
  }[]
}

export interface PortfolioSummary {
  totalPatients: number
  cohortSummaries: CohortSummary[]
  scenarioTotals: {
    label: string
    totalMonthlyRev: number
    gpMonth2At500: number
    gpMonth2Real: number
  }[]
  codeBreakdown: {
    codes: string
    name: string
    patientsEligible: number
    totalMonthlyRev: number
    unconfirmed: boolean
  }[]
}

export function computePortfolioSummary(cohorts: Cohort[]): PortfolioSummary {
  const totalPatients = cohorts.reduce((s, c) => s + c.patientCount, 0)
  const SCENARIO_LABELS = ['Today', '+ PsychNP', '+ MD', '+ Psychiatrist']

  const cohortSummaries: CohortSummary[] = cohorts.map(cohort => {
    const scenarios = getScenarios(cohort.profile)
    return {
      cohortId: cohort.id,
      label: cohort.label,
      patientCount: cohort.patientCount,
      scenarios: scenarios.map(s => ({
        label: s.label,
        totalMonthlyRev: s.locked ? 0 : s.totalMonthlyRev * cohort.patientCount,
        gpMonth1At500: s.locked ? 0 : s.gpMonth1At500 * cohort.patientCount,
        gpMonth2At500: s.locked ? 0 : s.gpMonth2At500 * cohort.patientCount,
        gpMonth2Real: s.locked ? 0 : s.gpMonth2Real * cohort.patientCount,
        locked: s.locked,
      })),
    }
  })

  const scenarioTotals = SCENARIO_LABELS.map(label => {
    const totals = cohortSummaries.reduce(
      (acc, cs) => {
        const s = cs.scenarios.find(s => s.label === label)
        if (!s) return acc
        return {
          totalMonthlyRev: acc.totalMonthlyRev + s.totalMonthlyRev,
          gpMonth2At500: acc.gpMonth2At500 + s.gpMonth2At500,
          gpMonth2Real: acc.gpMonth2Real + s.gpMonth2Real,
        }
      },
      { totalMonthlyRev: 0, gpMonth2At500: 0, gpMonth2Real: 0 }
    )
    return { label, ...totals }
  })

  // Code breakdown via PsychNP scenario (reference scenario for max eligible codes)
  const codeMap = new Map<string, {
    codes: string; name: string; patientsEligible: number; totalMonthlyRev: number; unconfirmed: boolean
  }>()
  for (const cohort of cohorts) {
    const scenarios = getScenarios(cohort.profile)
    const npScenario = scenarios.find(s => s.label === '+ PsychNP')
    if (!npScenario || npScenario.locked) continue
    for (const code of npScenario.eligibleCodes) {
      const existing = codeMap.get(code.codes)
      if (existing) {
        existing.patientsEligible += cohort.patientCount
        existing.totalMonthlyRev += code.monthlyRev * cohort.patientCount
      } else {
        codeMap.set(code.codes, {
          codes: code.codes,
          name: code.name,
          patientsEligible: cohort.patientCount,
          totalMonthlyRev: code.monthlyRev * cohort.patientCount,
          unconfirmed: code.unconfirmed,
        })
      }
    }
  }

  return {
    totalPatients,
    cohortSummaries,
    scenarioTotals,
    codeBreakdown: Array.from(codeMap.values()),
  }
}

export interface PatientRowSummary {
  patientId: string
  displayName: string
  scenarios: {
    label: string
    totalMonthlyRev: number
    gpMonth2Real: number
    locked: boolean
    eligibleCodeNames: string[]
  }[]
  bestScenarioRev: number
  todayRev: number
  todayLocked: boolean
}

export interface DashboardSummary {
  totalPatients: number
  lockedPatients: number
  patientSummaries: PatientRowSummary[]
  totalRevIfPsychNP: number
  totalRevToday: number
  opportunityGap: number
}

export function computeDashboardSummary(patients: Patient[]): DashboardSummary {
  const patientSummaries: PatientRowSummary[] = patients.map(patient => {
    const scenarios = getScenarios(patient.profile)
    const todayScenario = scenarios.find(s => s.label === 'Today')!
    const npScenario = scenarios.find(s => s.label === '+ PsychNP')!

    return {
      patientId: patient.id,
      displayName: patient.displayName,
      scenarios: scenarios.map(s => ({
        label: s.label,
        totalMonthlyRev: s.totalMonthlyRev,
        gpMonth2Real: s.gpMonth2Real,
        locked: s.locked,
        eligibleCodeNames: s.eligibleCodes.map(c => c.name),
      })),
      bestScenarioRev: npScenario.totalMonthlyRev,
      todayRev: todayScenario.totalMonthlyRev,
      todayLocked: todayScenario.locked,
    }
  })

  const totalRevToday = patientSummaries.reduce((s, p) => s + p.todayRev, 0)
  const totalRevIfPsychNP = patientSummaries.reduce((s, p) => s + p.bestScenarioRev, 0)

  return {
    totalPatients: patients.length,
    lockedPatients: patientSummaries.filter(p => p.todayLocked).length,
    patientSummaries,
    totalRevIfPsychNP,
    totalRevToday,
    opportunityGap: totalRevIfPsychNP - totalRevToday,
  }
}
