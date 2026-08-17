import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Advocacy Billing Model — Mervin',
  description: 'Patient-level Medicare advocacy billing eligibility and revenue modeling tool',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  )
}
