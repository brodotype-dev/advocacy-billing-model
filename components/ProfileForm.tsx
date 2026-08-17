import type { PatientProfile } from '@/lib/eligibility'

function Toggle({ label, hint, options, value, onChange }: {
  label: string
  hint?: string
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">{label}</p>
      <div className="flex rounded-lg overflow-hidden border border-slate-200 bg-white w-fit">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              value === opt.value
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1 max-w-xs">{hint}</p>}
    </div>
  )
}

function BoolToggle({ label, hint, value, onChange }: {
  label: string
  hint?: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <Toggle
      label={label}
      hint={hint}
      options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
      value={value ? 'yes' : 'no'}
      onChange={(v) => onChange(v === 'yes')}
    />
  )
}

export default function ProfileForm({
  profile,
  onChange,
}: {
  profile: PatientProfile
  onChange: (p: PatientProfile) => void
}) {
  return (
    <div className="flex flex-wrap gap-6">
      <Toggle
        label="Therapist type"
        hint="Determines unlock path. LCSW requires MD/NP E&M visit to bill G codes."
        options={[
          { label: 'Psychologist', value: 'psychologist' },
          { label: 'LCSW', value: 'lcsw' },
        ]}
        value={profile.therapistType}
        onChange={(v) => onChange({ ...profile, therapistType: v as 'psychologist' | 'lcsw' })}
      />
      <Toggle
        label="Chronic conditions"
        hint="2+ required for PIN-PS. Each must be serious, expected to last 3+ months."
        options={[
          { label: '1', value: 'one' },
          { label: '2+', value: 'multiple' },
        ]}
        value={profile.conditions}
        onChange={(v) => onChange({ ...profile, conditions: v as 'one' | 'multiple' })}
      />
      <BoolToggle
        label="SDOH risk factor"
        hint="Housing, food, transport, or social isolation. Must be documented as a Z-code in chart."
        value={profile.sdoh}
        onChange={(v) => onChange({ ...profile, sdoh: v })}
      />
      <BoolToggle
        label="BH affects physical care"
        hint="F-code diagnosis + therapist notes explicitly linking BH to physical condition management. Required for PIN-PS."
        value={profile.bhImpact}
        onChange={(v) => onChange({ ...profile, bhImpact: v })}
      />
      <Toggle
        label="Add-on units"
        options={[
          { label: 'Base (1 unit)', value: 'base' },
          { label: 'Higher (2 units)', value: 'appeals' },
        ]}
        hint="CMS sets no cap — use FFS Model for full range."
        value={profile.includeAppeals ? 'appeals' : 'base'}
        onChange={(v) => onChange({ ...profile, includeAppeals: v === 'appeals' })}
      />
    </div>
  )
}

export function profileLabel(profile: PatientProfile): string {
  const parts = [
    profile.therapistType === 'psychologist' ? 'Psychologist' : 'LCSW',
    profile.conditions === 'multiple' ? '2+ conditions' : '1 condition',
    profile.sdoh ? 'SDOH' : null,
    profile.bhImpact ? 'BH→physical' : null,
    profile.includeAppeals ? 'appeals' : null,
  ].filter(Boolean)
  return parts.join(' · ')
}
