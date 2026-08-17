// Comprehensive code definitions for advocacy billing
// Rates: confirmed 2025 CMS Physician Fee Schedule (National Non-Facility)
// Source: 2025 PFS; rates effective Jan 1 2025

export type CodeCategory = 'PIN' | 'CHI' | 'PIN-PS' | 'BHI' | 'PCM' | 'CoCM' | 'E&M' | 'Therapy'
export type ConfidenceLevel = 'confirmed' | 'likely' | 'unconfirmed'

export interface CodeDefinition {
  code: string
  name: string
  fullName: string
  category: CodeCategory
  rate2025: number
  timeRequirement: string
  unitsPerMonth: string
  patientCriteria: string
  whoCanBill: string
  whoCanSupervise: string
  unlockPath: string
  stacksWith: string[]
  mutuallyExclusive: string[]
  nuances: string[]
  confidence: ConfidenceLevel
  confirmationNote?: string
}

export const CODE_DEFINITIONS: CodeDefinition[] = [
  // ── PIN codes ─────────────────────────────────────────────────────────────
  {
    code: 'G0023',
    name: 'PIN — first 60 min',
    fullName: 'Principal Illness Navigation Services, first 60 minutes per calendar month',
    category: 'PIN',
    rate2025: 79.24,
    timeRequirement: 'Minimum 60 minutes of navigation services in the month',
    unitsPerMonth: '1 unit (base). Add-on units via G0024.',
    patientCriteria:
      'Medicare beneficiary with at least one serious illness or chronic condition. No minimum condition count — single chronic condition qualifies.',
    whoCanBill:
      'Physician, NP, PA, CNS, or CNM. Psychologist (via 90791) may also unlock — unconfirmed.',
    whoCanSupervise:
      'Supervising physician or qualified NPP. Navigator performs the work under general supervision.',
    unlockPath:
      'Either: (1) Psychologist 90791 establishes medical necessity [unconfirmed for PIN], or (2) MD/NP E&M visit (99203) in first month.',
    stacksWith: ['G0019', 'G0022', '99484'],
    mutuallyExclusive: ['G0140', 'G0146'],
    nuances: [
      'Cannot bill G0023 and G0140 (PIN-PS) for the same patient in the same month — choose one.',
      'Services include: care coordination, health education, referral management, advance directive discussions, insurance navigation.',
      'Both face-to-face and non-face-to-face time counts toward the monthly minimum.',
      '2025 rate: $79.24 (up from $77.95 in 2024).',
    ],
    confidence: 'confirmed',
  },
  {
    code: 'G0024',
    name: 'PIN — add-on 30 min',
    fullName: 'Principal Illness Navigation Services, each additional 30 minutes per calendar month',
    category: 'PIN',
    rate2025: 49.44,
    timeRequirement: 'Each additional 30 minutes beyond the first 60 min',
    unitsPerMonth: '2–3 units likely enforceable; exact 2025 cap unconfirmed. FL may allow more.',
    patientCriteria: 'Same as G0023 — billed as add-on.',
    whoCanBill: 'Same as G0023.',
    whoCanSupervise: 'Same as G0023.',
    unlockPath: 'Requires G0023 to have been billed first.',
    stacksWith: ['G0019', 'G0022', '99484'],
    mutuallyExclusive: ['G0140', 'G0146'],
    nuances: [
      'Pre-2025 some billers were billing 10+ units/month. CMS now enforcing a 2–3 unit cap.',
      'Appeals process: submit with documentation of time spent; first appeal almost always denied.',
      'Clinical lead note: PIN-PS add-on (G0146) may have better appeal success than G0024 — validate.',
      '2025 rate: $49.44 (up from $48.52 in 2024).',
    ],
    confidence: 'unconfirmed',
    confirmationNote: 'Confirm exact unit cap with MAC before modeling appeal revenue.',
  },

  // ── CHI codes ─────────────────────────────────────────────────────────────
  {
    code: 'G0019',
    name: 'CHI — first 60 min',
    fullName: 'Community Health Integration Services, first 60 minutes per calendar month',
    category: 'CHI',
    rate2025: 79.24,
    timeRequirement: 'Minimum 60 minutes of community health integration services in the month',
    unitsPerMonth: '1 unit (base). Add-on units via G0022.',
    patientCriteria:
      'Medicare beneficiary with a serious health condition AND at least one social determinant of health (SDOH) risk factor. SDOH factors include: housing instability, food insecurity, transportation barriers, social isolation, inadequate utilities, domestic safety concerns.',
    whoCanBill:
      'Physician, NP, PA, CNS, CNM. Psychologist (via 90791) may unlock — unconfirmed for CHI specifically.',
    whoCanSupervise: 'Same as G0023.',
    unlockPath:
      'Either: (1) Psychologist 90791 [unconfirmed for CHI], or (2) MD/NP E&M in first month. Unlock path same as PIN but CHI = SDOH-focused.',
    stacksWith: ['G0023', 'G0024', 'G0140', 'G0146', '99484'],
    mutuallyExclusive: [],
    nuances: [
      'CHI and PIN address different needs and stack in the same month: PIN = illness navigation; CHI = social/community needs.',
      'CHI services include: SDOH screening, community resource referrals, transportation assistance, food/housing navigation, social support coordination.',
      'Patient must have documented SDOH risk — this should appear in chart notes or intake assessment.',
      '2025 rate: $79.24 (same as G0023).',
    ],
    confidence: 'likely',
    confirmationNote: 'Confirm whether psychologist 90791 unlocks CHI (vs. only PIN). Likely yes but not explicitly documented.',
  },
  {
    code: 'G0022',
    name: 'CHI — add-on 30 min',
    fullName: 'Community Health Integration Services, each additional 30 minutes per calendar month',
    category: 'CHI',
    rate2025: 49.44,
    timeRequirement: 'Each additional 30 minutes beyond first 60 min',
    unitsPerMonth: 'Same cap as G0024 — 2–3 units/month likely. Unconfirmed.',
    patientCriteria: 'Same as G0019.',
    whoCanBill: 'Same as G0019.',
    whoCanSupervise: 'Same as G0019.',
    unlockPath: 'Requires G0019.',
    stacksWith: ['G0023', 'G0024', 'G0140', 'G0146', '99484'],
    mutuallyExclusive: [],
    nuances: [
      'Same unit cap rules as G0024 — model conservatively at 1 unit base.',
      '2025 rate: $49.44 (same as G0024).',
    ],
    confidence: 'unconfirmed',
    confirmationNote: 'Confirm unit cap with MAC.',
  },

  // ── PIN-PS codes ──────────────────────────────────────────────────────────
  {
    code: 'G0140',
    name: 'PIN-PS — first 60 min',
    fullName: 'Principal Illness Navigation — Peer Support Services, first 60 minutes per calendar month',
    category: 'PIN-PS',
    rate2025: 79.24,
    timeRequirement: 'Minimum 60 minutes per month',
    unitsPerMonth: '1 unit (base). Add-on via G0146.',
    patientCriteria:
      'Medicare beneficiary with TWO OR MORE chronic conditions AND a behavioral health condition (mental health or substance use disorder) that contributes to or exacerbates the physical conditions. Higher bar than PIN.',
    whoCanBill:
      'Physician, NP, PA, CNS, CNM. The "peer support" element means the navigator ideally has lived experience with similar health challenges.',
    whoCanSupervise: 'Same general supervision requirements as PIN.',
    unlockPath:
      'Psychologist 90791 likely unlocks (model treats this as standard) — needs confirmation. MD/NP E&M also unlocks.',
    stacksWith: ['G0019', 'G0022', '99484'],
    mutuallyExclusive: ['G0023', 'G0024'],
    nuances: [
      'CANNOT bill G0140 and G0023 (PIN) in the same month for the same patient. Choose one.',
      'PIN-PS is preferred over PIN when patient qualifies because: (1) higher reimbursement potential via appeals, (2) the clinical lead\'s note that appeal success rate may be better.',
      'The "peer support" distinction: navigator ideally has lived experience with conditions similar to the patient\'s — documented in care plan.',
      'BH impact must be documented in chart notes — e.g., depression exacerbating diabetes management, anxiety impacting CHF compliance.',
      '2025 rate: $79.24 (same as G0023/G0019).',
    ],
    confidence: 'likely',
    confirmationNote: 'Confirm: (1) psychologist 90791 unlock for PIN-PS, (2) whether appeal success genuinely differs from G0023.',
  },
  {
    code: 'G0146',
    name: 'PIN-PS — add-on 30 min',
    fullName: 'Principal Illness Navigation — Peer Support Services, each additional 30 minutes per calendar month',
    category: 'PIN-PS',
    rate2025: 49.44,
    timeRequirement: 'Each additional 30 minutes beyond first 60 min',
    unitsPerMonth: 'Same cap as G0024/G0022. Unconfirmed.',
    patientCriteria: 'Same as G0140.',
    whoCanBill: 'Same as G0140.',
    whoCanSupervise: 'Same as G0140.',
    unlockPath: 'Requires G0140.',
    stacksWith: ['G0019', 'G0022', '99484'],
    mutuallyExclusive: ['G0023', 'G0024'],
    nuances: [
      'Clinical lead heard appeal success rate for G0146 may be higher than G0024. If true, prefer PIN-PS over PIN for appeal strategy.',
      '2025 rate: $49.44 (same as G0024/G0022).',
    ],
    confidence: 'unconfirmed',
    confirmationNote: 'Confirm unit cap and whether appeal success genuinely differs vs G0024.',
  },

  // ── BHI ───────────────────────────────────────────────────────────────────
  {
    code: '99484',
    name: 'BHI — 20 min/month',
    fullName: 'Behavioral Health Integration, clinical staff 20 minutes per calendar month',
    category: 'BHI',
    rate2025: 57.45,
    timeRequirement: 'Minimum 20 minutes of BHI services per month',
    unitsPerMonth: '1 unit per month (20-min minimum). Episodic vs. monthly billing unconfirmed.',
    patientCriteria:
      'Patient with a behavioral health condition being managed or integrated with other care. Typically requires documented BH diagnosis.',
    whoCanBill: 'Physician, NP, PA. Psychologist supervision uncertain — likely requires MD/NP.',
    whoCanSupervise: 'Supervising physician or NPP required. Clinical staff (navigator) performs services.',
    unlockPath: 'Requires MD/NP supervision. Cannot be unlocked by psychologist 90791 alone — unconfirmed.',
    stacksWith: ['G0023', 'G0024', 'G0019', 'G0022', 'G0140', 'G0146'],
    mutuallyExclusive: [],
    nuances: [
      'BHI is specifically for behavioral health integration — services like depression screening follow-up, medication adherence for BH medications, coordination between BH and medical providers.',
      'Stacks cleanly with PIN/CHI/PIN-PS codes — different service focus.',
      'Key question: is this billable monthly (recurring) or only episodically when triggered by a BH event? Billing frequency affects annual revenue materially.',
    ],
    confidence: 'unconfirmed',
    confirmationNote: 'Confirm: (1) monthly vs episodic, (2) whether psychologist supervision is sufficient.',
  },

  // ── PCM codes ─────────────────────────────────────────────────────────────
  {
    code: '99426',
    name: 'PCM — first 30 min',
    fullName: 'Principal Care Management, clinical staff first 30 minutes per calendar month',
    category: 'PCM',
    rate2025: 67.80,
    timeRequirement: 'Minimum 30 minutes of care management per month',
    unitsPerMonth: '1 unit (base). Add-on via 99427.',
    patientCriteria:
      'Medicare beneficiary with ONE serious chronic condition expected to last ≥3 months that places the patient at significant risk of hospitalization, functional decline, or death. Disease-specific (single condition focus). NOT for patients with 2+ comorbidities managed together — that would be CCM.',
    whoCanBill: 'Physician, NP, PA, CNS, CNM. Clinical staff perform services under supervision.',
    whoCanSupervise: 'Requires supervising physician/NP — 24-hour access to care plan and ability to leave message required.',
    unlockPath: 'MD/NP supervision required. Psychologist cannot unlock PCM.',
    stacksWith: [],
    mutuallyExclusive: ['99490', '99439', '99491'],
    nuances: [
      'PCM is disease-specific: e.g., "managing diabetes" rather than "managing diabetes + hypertension + depression."',
      'Only needs 24-hour access to care plan and ability to leave message — lowest documentation bar of any care management code.',
      'Cannot stack with CCM (99490). Patient cannot receive both PCM and CCM in the same month.',
      'Critical question for the provider: can PCM stack with G codes (PIN/CHI) in the same month? Different service types — likely yes, but needs MAC confirmation.',
      'Limited fit for the provider\'s population: most patients have 2+ conditions → CCM-eligible (not PCM). PCM applies to a subset only.',
      '2025 rate: $67.80 (updated from prior estimate).',
    ],
    confidence: 'unconfirmed',
    confirmationNote: 'Confirm PCM + G code stacking in same month with MAC before modeling as revenue.',
  },
  {
    code: '99427',
    name: 'PCM — add-on 30 min',
    fullName: 'Principal Care Management, each additional 30 minutes per calendar month',
    category: 'PCM',
    rate2025: 54.11,
    timeRequirement: 'Each additional 30 minutes beyond first 30 min',
    unitsPerMonth: '1–2 add-on units typical.',
    patientCriteria: 'Same as 99426.',
    whoCanBill: 'Same as 99426.',
    whoCanSupervise: 'Same as 99426.',
    unlockPath: 'Requires 99426.',
    stacksWith: [],
    mutuallyExclusive: ['99490', '99439', '99491'],
    nuances: ['2025 rate: $54.11 (updated from prior estimate).'],
    confidence: 'unconfirmed',
    confirmationNote: 'Same as 99426 — confirm stacking rules.',
  },

  // ── CoCM codes ────────────────────────────────────────────────────────────
  {
    code: '99492',
    name: 'CoCM — first month',
    fullName: 'Collaborative Care Management, first calendar month',
    category: 'CoCM',
    rate2025: 215,
    timeRequirement: '70 minutes total: ≥35 min behavioral health care manager + ≥35 min psychiatric consultant review',
    unitsPerMonth: '1 unit (first month only — use 99493 for subsequent months)',
    patientCriteria:
      'Patient enrolled in a Collaborative Care Model program. Typically patients with BH conditions being treated in a primary care or integrated setting. Three-person team required.',
    whoCanBill: 'Treating physician or qualified NPP who directs the CoCM program.',
    whoCanSupervise:
      'Requires: (1) treating provider (LCSW or psychologist), (2) behavioral health care manager (can be existing LCSW), (3) psychiatric consultant (psychiatrist). Psychiatrist does NOT need to see the patient — chart review sufficient.',
    unlockPath:
      'Requires a full three-person CoCM team. Psychiatrist unlocks CoCM — this is the primary reason to hire a psychiatrist over an NP for the provider.',
    stacksWith: [],
    mutuallyExclusive: [],
    nuances: [
      'CoCM is set aside for now per clinical lead (Mar 2026) — focus on PIN/CHI/PCM first.',
      'The psychiatrist does NOT need to see the patient in CoCM — monthly case review of the registry is sufficient.',
      'Requires: active patient registry, documented care plan, monthly case reviews, BH care manager time tracking.',
      'Hard infrastructure dependency: monthly recurring claim generation — not viable without the billing platform v2 automation.',
      '2025 rate: $215 first month, $145 subsequent months (99493).',
    ],
    confidence: 'confirmed',
    confirmationNote: 'Out of scope for current phase — revisit after the billing platform v2 live and advocacy pilot validated.',
  },
  {
    code: '99493',
    name: 'CoCM — subsequent months',
    fullName: 'Collaborative Care Management, subsequent calendar months',
    category: 'CoCM',
    rate2025: 145,
    timeRequirement: '60 minutes total per month',
    unitsPerMonth: '1 unit per month (recurring)',
    patientCriteria: 'Same as 99492 — ongoing enrollment.',
    whoCanBill: 'Same as 99492.',
    whoCanSupervise: 'Same as 99492.',
    unlockPath: 'Same as 99492.',
    stacksWith: [],
    mutuallyExclusive: [],
    nuances: ['Primary recurring revenue code for CoCM program. Out of scope for current phase.'],
    confidence: 'confirmed',
  },
  {
    code: '99494',
    name: 'CoCM — add-on (≥30 min psych)',
    fullName: 'Collaborative Care Management, each additional 30 minutes in a calendar month',
    category: 'CoCM',
    rate2025: 75,
    timeRequirement: '≥30 additional minutes of psychiatric consultant time',
    unitsPerMonth: 'Up to 2 add-on units.',
    patientCriteria: 'Same as 99492/99493.',
    whoCanBill: 'Same as 99492.',
    whoCanSupervise: 'Same as 99492.',
    unlockPath: 'Requires 99492 or 99493.',
    stacksWith: [],
    mutuallyExclusive: [],
    nuances: ['Add-on only when psychiatrist spends additional time beyond the base. Modeled as upside.'],
    confidence: 'confirmed',
  },

  // ── E&M codes ─────────────────────────────────────────────────────────────
  {
    code: '99203',
    name: 'E&M — new patient (advocacy unlock)',
    fullName: 'Office or Other Outpatient Visit, New Patient, Low to Moderate Complexity',
    category: 'E&M',
    rate2025: 115,
    timeRequirement: '30–44 minutes or low-moderate medical decision complexity',
    unitsPerMonth: '1 unit (month 1 only for advocacy unlock)',
    patientCriteria: 'New patient who has not been seen by this provider/group in 3 years.',
    whoCanBill: 'MD, NP, PA, CNS, CNM.',
    whoCanSupervise: 'N/A — billing provider performs the visit.',
    unlockPath: 'This IS the unlock — billing this E&M establishes medical necessity for PIN/CHI/PIN-PS advocacy billing.',
    stacksWith: [],
    mutuallyExclusive: [],
    nuances: [
      'The initiating visit for LCSW patients: 20-min NP visit billed as 99203 unlocks all advocacy codes for that month.',
      'At $110/hr NP rate, 20-min visit costs ~$37. Unlocks $79–$316+/month in advocacy revenue.',
      'Subsequent months: chart review only (no patient contact required for ongoing PIN supervision).',
    ],
    confidence: 'confirmed',
  },
  {
    code: '99204',
    name: 'E&M — new psych patient (moderate)',
    fullName: 'Office or Other Outpatient Visit, New Patient, Moderate Complexity',
    category: 'E&M',
    rate2025: 124,
    timeRequirement: '45–59 minutes or moderate medical decision complexity',
    unitsPerMonth: '1 unit (initial evaluation)',
    patientCriteria: 'New psychiatric patient, moderate complexity.',
    whoCanBill: 'Psychiatrist, psychiatric NP.',
    whoCanSupervise: 'N/A.',
    unlockPath: 'Psychiatry intake code — initiates the psychiatric billing relationship.',
    stacksWith: ['90833'],
    mutuallyExclusive: [],
    nuances: ['Combinable with 90833 (16-min therapy add-on) in same visit for additional revenue.'],
    confidence: 'confirmed',
  },
  {
    code: '99214',
    name: 'E&M — established psych (moderate)',
    fullName: 'Office or Other Outpatient Visit, Established Patient, Moderate Complexity',
    category: 'E&M',
    rate2025: 90,
    timeRequirement: '30–39 minutes or moderate medical decision complexity',
    unitsPerMonth: '1 per visit (monthly follow-up typical)',
    patientCriteria: 'Established psychiatric patient, moderate complexity.',
    whoCanBill: 'Psychiatrist, psychiatric NP.',
    whoCanSupervise: 'N/A.',
    unlockPath: 'Monthly psychiatry follow-up code.',
    stacksWith: ['90833'],
    mutuallyExclusive: [],
    nuances: [
      'Moderate complexity: stable conditions on 1–2 medications, routine labs, no crisis.',
      'Combinable with 90833 for additional $68 per visit.',
      'Clinical lead complexity guess: 10% moderate — actual may be higher given the provider\'s high-acuity senior population.',
    ],
    confidence: 'confirmed',
  },
  {
    code: '99215',
    name: 'E&M — established psych (high)',
    fullName: 'Office or Other Outpatient Visit, Established Patient, High Complexity',
    category: 'E&M',
    rate2025: 125,
    timeRequirement: '40–54 minutes or high medical decision complexity',
    unitsPerMonth: '1 per visit',
    patientCriteria:
      'Established psychiatric patient, high complexity. High complexity driven by: multiple psychiatric diagnoses, polypharmacy (especially controlled substances), cognitive impairment overlay, crisis risk, complex medication management.',
    whoCanBill: 'Psychiatrist, psychiatric NP.',
    whoCanSupervise: 'N/A.',
    unlockPath: 'Monthly psychiatry follow-up — high complexity tier.',
    stacksWith: ['90833'],
    mutuallyExclusive: [],
    nuances: [
      'Polypharmacy note: patients on 5+ medications (especially mixing controlled + non-controlled) drive high complexity designation.',
      'Clinical lead complexity guess: 60% high for the provider\'s senior population — plausible given poly-pharmacy prevalence.',
      'High complexity = highest audit risk. Must document medical decision-making rigorously.',
    ],
    confidence: 'confirmed',
  },

  // ── Therapy add-on ────────────────────────────────────────────────────────
  {
    code: '90833',
    name: 'Psychotherapy add-on (16 min)',
    fullName: 'Psychotherapy, 16–37 minutes, add-on to E&M',
    category: 'Therapy',
    rate2025: 68,
    timeRequirement: '16–37 minutes of psychotherapy during same visit as E&M',
    unitsPerMonth: '1 per visit where combined with E&M',
    patientCriteria: 'Patient receiving both medication management (E&M) and psychotherapy in the same visit.',
    whoCanBill: 'Psychiatrist or psychiatric NP performing both services in the same session.',
    whoCanSupervise: 'N/A.',
    unlockPath: 'Billed as add-on to 99204, 99214, or 99215 — not a standalone code.',
    stacksWith: ['99204', '99214', '99215'],
    mutuallyExclusive: [],
    nuances: [
      'Adds $68 to any visit where the psychiatrist also provides psychotherapy — strong add to the psychiatry model.',
      '90863 (medication management only) pays much less — always prefer 99214 + 90833 over 90863.',
    ],
    confidence: 'confirmed',
  },
]

export const CATEGORIES: { id: CodeCategory; label: string; description: string }[] = [
  { id: 'PIN', label: 'Principal Illness Navigation', description: 'Navigation services for patients with chronic illness. Requires 1+ chronic condition.' },
  { id: 'CHI', label: 'Community Health Integration', description: 'SDOH-focused navigation. Requires documented social risk factor. Stacks with PIN/PIN-PS.' },
  { id: 'PIN-PS', label: 'PIN — Peer Support', description: 'Illness navigation with peer support component. Requires 2+ conditions + BH impact. Mutually exclusive with PIN.' },
  { id: 'BHI', label: 'Behavioral Health Integration', description: '20 min/month BH integration. Stacks with G codes. Monthly vs episodic billing unconfirmed.' },
  { id: 'PCM', label: 'Principal Care Management', description: 'Care management for ONE serious chronic condition. Limited fit for the provider\'s multi-morbid population.' },
  { id: 'CoCM', label: 'Collaborative Care Model', description: 'Three-person team: therapist + BH care manager + psychiatrist. Out of scope for current phase.' },
  { id: 'E&M', label: 'Evaluation & Management', description: 'Provider visits. 99203 unlocks advocacy billing for LCSW patients. Psychiatry E&M bills separately.' },
  { id: 'Therapy', label: 'Psychotherapy Add-on', description: '90833 adds $68 when psychotherapy provided alongside E&M visit.' },
]
