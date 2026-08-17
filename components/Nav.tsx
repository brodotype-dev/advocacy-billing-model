'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Calculator', href: '/' },
  { label: 'FFS Model', href: '/ffs' },
  { label: 'Psychiatry', href: '/psychiatry' },
  { label: 'Primary Care MD', href: '/primary-care' },
  { label: 'Assumptions', href: '/assumptions' },
  { label: 'Codes', href: '/codes' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-slate-900">Advocacy Billing Model</span>
          <p className="text-xs text-slate-500 mt-0.5">Medicare advocacy billing economics</p>
        </div>
        <nav className="flex items-center gap-1 flex-wrap">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-mono">v0.2</span>
        </nav>
      </div>
    </header>
  )
}
