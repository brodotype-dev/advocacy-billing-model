import Nav from '@/components/Nav'
import Link from 'next/link'

export const metadata = {
  title: 'How it works & why — Advocacy Billing Model',
  description: 'What this tool models, how to use it, and the problem it was built to solve.',
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="shrink-0 w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center justify-center">
        {n}
      </span>
      <div className="space-y-1">
        <p className="font-medium text-slate-800 text-sm">{title}</p>
        <p className="text-sm text-slate-600">{children}</p>
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Nav />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">How it works &amp; why</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            A two-minute orientation: the problem this models, how to read the numbers,
            and what to be skeptical about.
          </p>
        </div>

        {/* Why */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Why this exists</h3>
          <p className="text-sm text-slate-600">
            In 2024 CMS started paying for work that had always been unpaid. Principal Illness Navigation
            (PIN), Community Health Integration (CHI), and their peer-support variants let a care team bill
            for advocacy — benefits navigation, coordinating around housing or food insecurity, chasing down
            a specialist referral. Real work, now with a real code attached.
          </p>
          <p className="text-sm text-slate-600">
            The catch is that eligibility isn&apos;t a checkbox. It depends on who the patient&apos;s therapist
            is, how many chronic conditions they carry, whether a social-needs risk factor is documented,
            whether behavioral health demonstrably affects their physical care, and — critically — which
            licensed provider signed the chart. Those conditions interact. Change one and the billable stack
            changes with it.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600">
            <span className="font-medium text-slate-800">The actual question behind all of it:</span> does hiring
            a clinician pay for itself? A nurse practitioner or MD unlocks billing that a therapist alone
            cannot — but only above some patient volume does that unlock cover the salary. Nobody could answer
            that from a fee schedule PDF. So the rules got encoded here instead, where the answer is a number
            you can watch move.
          </div>
        </section>

        {/* How to use */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">How to use it</h3>

          <Step n="1" title="Start with one patient">
            On the <Link href="/" className="text-blue-600 hover:underline font-medium">Calculator</Link>, set
            a patient profile — therapist type, condition count, social-needs risk, add-on units. The four
            cards below show what that same patient is worth today versus with a PsychNP, an MD, or a
            psychiatrist on the team. The gap between the first card and the others is the whole business case.
          </Step>

          <Step n="2" title="Scale it to a panel">
            <Link href="/model" className="text-blue-600 hover:underline font-medium">Portfolio Modeler</Link> takes
            cohorts of patients and gives aggregate monthly revenue and gross profit.
            {' '}<Link href="/patients" className="text-blue-600 hover:underline font-medium">Patient Dashboard</Link> does
            the same for named individuals and flags what&apos;s being left unbilled. Both persist in your browser only.
          </Step>

          <Step n="3" title="Pressure-test the economics">
            <Link href="/ffs" className="text-blue-600 hover:underline font-medium">FFS Model</Link> reframes
            everything in minutes rather than dollars — advocate time is the real constraint, and this is where
            the margin per minute either works or doesn&apos;t.
          </Step>

          <Step n="4" title="Check the hiring cases">
            <Link href="/psychiatry" className="text-blue-600 hover:underline font-medium">Psychiatry</Link> and
            {' '}<Link href="/primary-care" className="text-blue-600 hover:underline font-medium">Primary Care MD</Link> each
            model a specific hire against break-even patient volume, including the supervision rules that
            constrain who can oversee whom.
          </Step>

          <Step n="5" title="Interrogate every number">
            <Link href="/assumptions" className="text-blue-600 hover:underline font-medium">Assumptions</Link> lists
            every rate and rule with a confidence flag.
            {' '}<Link href="/codes" className="text-blue-600 hover:underline font-medium">Codes</Link> gives the
            full definition, unlock path, and stacking rules for all 16 codes. Nothing in the model is a
            number without a source.
          </Step>
        </section>

        {/* Caveats */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">What to be skeptical about</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <p className="font-semibold text-amber-800 mb-1">Rates are CY 2025</p>
              <p className="text-amber-700 text-xs">
                Modeled on the 2025 CMS Physician Fee Schedule, national non-facility. Treat every dollar
                figure as a dated snapshot, not a current quote.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <p className="font-semibold text-amber-800 mb-1">Some rules are unconfirmed</p>
              <p className="text-amber-700 text-xs">
                Anything flagged ⚠ on Assumptions is a reasoned interpretation, not a MAC ruling. The
                psychologist unlock path is the biggest open one.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <p className="font-semibold text-amber-800 mb-1">Medicare Advantage varies</p>
              <p className="text-amber-700 text-xs">
                MA plans must cover PIN/CHI but can impose their own prior auth and unit limits. The model
                assumes traditional fee-for-service Medicare.
              </p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs text-slate-600">
            <span className="font-medium">Sourcing note:</span> operational inputs — advocate utilization,
            complexity mix, contracted hourly rates — come from practitioner interviews and are attributed by
            role on the Assumptions page. Regulatory inputs come from published CMS sources, cited there as well.
          </div>
        </section>

        <p className="text-xs text-slate-400 text-center pb-4">
          Not legal or compliance advice. Validate unconfirmed rules with your MAC or billing counsel before billing.
          <br />Advocacy Billing Model · Mervin · {new Date().getFullYear()}<br />Made by <a href="https://brodyclemmer.com/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 underline">Brody Clemmer</a>
        </p>
      </main>
    </div>
  )
}
