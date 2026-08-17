// Billing eligibility logic for advocacy billing program
// Rates: 2025 CMS Physician Fee Schedule estimates
// Rules marked UNCONFIRMED need MAC / expert validation before relying on them for billing

export type TherapistType = 'psychologist' | 'lcsw'
export type ConditionCount = 'one' | 'multiple'

export interface PatientProfile {
  therapistType: TherapistType
  conditions: ConditionCount
  sdoh: boolean
  bhImpact: boolean
  includeAppeals: boolean // whether to model 2 add-on units (vs. base 1)
}

export interface BillingCode {
  codes: string
  name: string
  monthlyRev: number
  unconfirmed: boolean
  warning?: string
}

export interface CareTeamScenario {
  label: string
  note?: string
  supervisionWarning?: string
  // Psychiatric E&M revenue (separate from advocacy) — shown as upside, not included in advocacy GP
  psychEmMonthly?: number
  psychEmNote?: string
  eMCostMonth1: number
  eligibleCodes: BillingCode[]
  totalMonthlyRev: number
  // Cost/GP at 500 min/month (cap utilization)
  advocateCostAt500: number
  gpMonth1At500: number
  gpMonth2At500: number
  // At 380 min/month (health advocate real avg for established patients)
  advocateCostReal: number
  gpMonth2Real: number
  warnings: string[]
  locked: boolean
}

// 2025 CMS Physician Fee Schedule — National Non-Facility (confirmed Jan 2025)
const R = {
  PIN_60: 79.24,   // G0023 — PIN base (up from $77.95)
  PIN_30: 49.44,   // G0024 — PIN add-on per unit (up from $48.52)
  CHI_60: 79.24,   // G0019 — CHI base (same rate as PIN)
  CHI_30: 49.44,   // G0022 — CHI add-on per unit
  PPS_60: 79.24,   // G0140 — PIN-PS base (same rate)
  PPS_30: 49.44,   // G0146 — PIN-PS add-on per unit
  BHI:    57.45,   // 99484 — Behavioral Health Integration
  PCM_1:  67.80,   // 99426 — PCM first 30 min (updated)
  PCM_2:  54.11,   // 99427 — PCM additional 30 min (updated)
}

const ADVOCATE_500 = 333   // $40/hr × 500 min (cap)
const ADVOCATE_380 = 253   // $40/hr × 380 min (real avg)
const EM_PSYCHNP   = 37    // $110/hr × 20 min
const EM_MD        = 50    // $150/hr × 20 min (general/internal medicine contracted)
const EM_PSYCH     = 53    // $160/hr × 20 min

// Psychiatric E&M — monthly revenue per psychiatric patient (separate from advocacy billing)
// Complexity mix per clinical lead: 30% low / 10% moderate / 60% high
// Rate does not vary by provider licensure (NP vs. MD) — facility vs. non-facility is the key
// distinction per PA Medicare guidance (PA MAC contact, Mar 2026). Both billed at non-facility rate:
// low 99213+90833=$147 / moderate 99214+90833=$186 / high 99215+90833=$227
const PSYCH_EM_NP   = Math.round(0.30 * 147 + 0.10 * 186 + 0.60 * 227)  // ≈ $199/mo
const PSYCH_EM_MD   = Math.round(0.30 * 147 + 0.10 * 186 + 0.60 * 227)  // ≈ $199/mo

function buildCodes(profile: PatientProfile, hasUnlock: boolean, hasMDUnlock: boolean): BillingCode[] {
  if (!hasUnlock) return []

  const codes: BillingCode[] = []
  const addOnUnits = profile.includeAppeals ? 2 : 1
  const canBillPINPS = profile.conditions === 'multiple' && profile.bhImpact

  // PIN vs PIN-PS (mutually exclusive — choose PIN-PS when eligible)
  if (canBillPINPS) {
    codes.push({
      codes: 'G0140 + G0146',
      name: 'PIN-PS',
      monthlyRev: R.PPS_60 + R.PPS_30 * addOnUnits,
      unconfirmed: profile.therapistType === 'psychologist',
      warning: profile.therapistType === 'psychologist'
        ? 'Psychologist 90791 → PIN-PS unlock unconfirmed'
        : undefined,
    })
  } else {
    codes.push({
      codes: 'G0023 + G0024',
      name: 'PIN',
      monthlyRev: R.PIN_60 + R.PIN_30 * addOnUnits,
      unconfirmed: false,
    })
  }

  // CHI — stacks with PIN or PIN-PS if SDOH present
  if (profile.sdoh) {
    codes.push({
      codes: 'G0019 + G0022',
      name: 'CHI',
      monthlyRev: R.CHI_60 + R.CHI_30 * addOnUnits,
      unconfirmed: profile.therapistType === 'psychologist',
      warning: profile.therapistType === 'psychologist'
        ? 'Psychologist 90791 → CHI unlock unconfirmed'
        : undefined,
    })
  }

  // BHI — likely needs MD/NP supervision
  if (hasMDUnlock) {
    codes.push({
      codes: '99484',
      name: 'BHI',
      monthlyRev: R.BHI,
      unconfirmed: true,
      warning: 'Monthly vs episodic billing unconfirmed',
    })
  } else if (profile.therapistType === 'psychologist') {
    codes.push({
      codes: '99484',
      name: 'BHI',
      monthlyRev: R.BHI,
      unconfirmed: true,
      warning: 'BHI supervision by psychologist alone unconfirmed',
    })
  }

  // PCM (99426/99427) excluded — cannot be billed in the same month as G codes
  // per PA Medicare guidance (PA MAC contact, Mar 2026). If a patient needs only PCM (no G codes),
  // model that separately.

  return codes
}

function toScenario(
  label: string,
  codes: BillingCode[],
  eMCost: number,
  locked: boolean
): CareTeamScenario {
  const rev = codes.reduce((s, c) => s + c.monthlyRev, 0)
  const warnings = codes.filter(c => c.warning).map(c => c.warning!)

  const note =
    label === '+ MD'
      ? 'Same advocacy codes as PsychNP. Higher unlock cost with no psychiatric E&M upside. Most useful if the provider also wants the MD to provide direct primary/internal medicine care.'
      : undefined

  const supervisionWarning =
    label === '+ PsychNP'
      ? '⚠️ State supervision risk: ~half of US states require physician oversight for NPs (non-full-practice-authority states). In those states, you effectively need to hire both an NP and a supervising MD — eliminating the cost advantage. Confirm your operating states before modeling PsychNP as the low-cost option.'
      : undefined

  const psychEmMonthly =
    label === '+ PsychNP' ? PSYCH_EM_NP
    : label === '+ Psychiatrist' ? PSYCH_EM_MD
    : undefined

  const psychEmNote =
    label === '+ PsychNP'
      ? `~$${PSYCH_EM_NP}/mo per patient seen for medication management (non-facility rate — same as psychiatrist per PA Medicare guidance; rate does not vary by licensure). Clinical lead complexity mix: 30% low / 10% mod / 60% high. Billed as: low 99213+90833=$147, moderate 99214+90833=$186, high 99215+90833=$227. Not included in advocacy GP above.`
      : label === '+ Psychiatrist'
      ? `~$${PSYCH_EM_MD}/mo per patient seen for medication management (non-facility rate, same mix). Billed as: low 99213+90833=$147, moderate 99214+90833=$186, high 99215+90833=$227. Also unlocks CoCM (99492/99493) at scale. Not included in advocacy GP above.`
      : undefined

  if (locked) {
    return {
      label,
      note,
      supervisionWarning,
      psychEmMonthly,
      psychEmNote,
      eMCostMonth1: 0,
      eligibleCodes: [],
      totalMonthlyRev: 0,
      advocateCostAt500: 0,
      gpMonth1At500: 0,
      gpMonth2At500: 0,
      advocateCostReal: 0,
      gpMonth2Real: 0,
      warnings: [],
      locked: true,
    }
  }

  return {
    label,
    note,
    supervisionWarning,
    psychEmMonthly,
    psychEmNote,
    eMCostMonth1: eMCost,
    eligibleCodes: codes,
    totalMonthlyRev: rev,
    advocateCostAt500: ADVOCATE_500,
    gpMonth1At500: rev - ADVOCATE_500 - eMCost,
    gpMonth2At500: rev - ADVOCATE_500,
    advocateCostReal: ADVOCATE_380,
    gpMonth2Real: rev - ADVOCATE_380,
    warnings,
    locked: false,
  }
}

export function getScenarios(profile: PatientProfile): CareTeamScenario[] {
  const psychUnlock = profile.therapistType === 'psychologist'

  const todayCodes   = buildCodes(profile, psychUnlock, false)
  const npCodes      = buildCodes(profile, true, true)
  const mdCodes      = buildCodes(profile, true, true)  // same codes as PsychNP — differs only in cost
  const psychCodes   = buildCodes(profile, true, true)

  return [
    toScenario('Today', todayCodes, 0, !psychUnlock),
    toScenario('+ PsychNP', npCodes, EM_PSYCHNP, false),
    toScenario('+ MD', mdCodes, EM_MD, false),
    toScenario('+ Psychiatrist', psychCodes, EM_PSYCH, false),
  ]
}

// Re-export CODE_DEFINITIONS as the authoritative reference (see lib/codes.ts)
export { CODE_DEFINITIONS as CODE_REFERENCE } from './codes'
