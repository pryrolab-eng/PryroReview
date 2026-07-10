'use client'

import Link from 'next/link'
import { useAddCompanyModal } from '@/lib/add-company-modal-context'

export function Footer() {
  const { openAddCompanyModal } = useAddCompanyModal()

  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">

        {/* ── Main grid: logo left | three columns right ── */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">

          {/* Left: Logo */}
          <div className="shrink-0 self-start lg:max-w-[160px]">
            <Link href="/" className="flex items-end gap-0">
              <img
                src="/images/pryro.png"
                alt="Pryro"
                className="h-8 w-auto object-contain rounded-lg"
              />
              <span className="text-sm font-semibold tracking-tight text-zinc-950 select-none">
                Review
              </span>
            </Link>
          </div>

          {/* Right: three columns */}
          <div className="flex flex-wrap gap-10 sm:gap-16 lg:gap-24">

            {/* Top Categories */}
            <div>
              <p className="text-sm font-semibold text-zinc-900">Top Categories</p>
              <ul className="mt-5 space-y-3">
                {[
                  { label: 'Banking', cat: 'Banking & Finance' },
                  { label: 'Telecommunications', cat: 'Telecommunications' },
                  { label: 'Government Services', cat: 'Government Services' },
                  { label: 'Healthcare', cat: 'Healthcare' },
                  { label: 'Insurance', cat: 'Insurance' },
                  { label: 'Education', cat: 'Education' },
                  { label: 'Transport', cat: 'Airlines & Transport' },
                  { label: 'Food & Beverage', cat: 'Food & Beverage' },
                  { label: 'All Categories', cat: null },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.cat ? `/?category=${encodeURIComponent(item.cat)}` : '/'}
                      className="text-sm text-zinc-500 hover:text-zinc-900"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-sm font-semibold text-zinc-900">Company</p>
              <ul className="mt-5 space-y-3">
                {[
                  { href: '/about', label: 'About PryroReview' },
                  { href: '/how-it-works', label: 'How It Works' },
                  { href: '/pricing', label: 'Pricing' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-zinc-500 hover:text-zinc-900">
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => openAddCompanyModal()}
                    className="text-sm text-zinc-500 hover:text-zinc-900"
                  >
                    Add a Company
                  </button>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <p className="text-sm font-semibold text-zinc-900">Quick Links</p>
              <ul className="mt-5 space-y-3">
                <li>
                  <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-zinc-500 hover:text-zinc-900">Home</Link>
                </li>
                <li>
                  <button
                    onClick={() => openAddCompanyModal()}
                    className="text-sm text-zinc-500 hover:text-zinc-900"
                  >
                    Add Company
                  </button>
                </li>
                <li>
                  <Link href="/my-reviews" className="text-sm text-zinc-500 hover:text-zinc-900">My Reviews</Link>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} PryroReview · Verified business reviews
          </p>
          <div className="flex items-center gap-5">
            {['Terms', 'Privacy', 'Cookies'].map((item) => (
              <Link key={item} href="#" className="text-xs text-zinc-400 hover:text-zinc-700">
                {item}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
