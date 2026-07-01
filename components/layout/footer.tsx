import Link from 'next/link'
import { Twitter, Linkedin, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        {/* ── Main grid: logo+nav left | three columns right ── */}
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">

          {/* Left: Logo only */}
          <div className="shrink-0 lg:max-w-[160px]">
            <Link href="/">
              <span className="text-lg font-extrabold tracking-tight text-zinc-950 select-none">
                PryroReview
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
                  'Banking',
                  'Telecommunications',
                  'Government Services',
                  'Healthcare',
                  'Insurance',
                  'Education',
                  'Transport',
                  'Food & Beverage',
                  'All Categories',
                ].map((item) => (
                  <li key={item}>
                    <Link href="/leaderboard" className="text-sm text-zinc-500 hover:text-zinc-900">
                      {item}
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
                  { href: '#', label: 'About PryroReview' },
                  { href: '#', label: 'How It Works' },
                  { href: '#', label: 'Pricing' },
                  { href: '/leaderboard', label: 'Leaderboard' },
                  { href: '/add-company', label: 'Add a Company' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-zinc-500 hover:text-zinc-900">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Social icons */}
              <div className="mt-6 flex items-center gap-3">
                <a href="#" aria-label="X / Twitter"
                  className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400">
                  <Twitter className="h-3.5 w-3.5" />
                </a>
                <a href="#" aria-label="LinkedIn"
                  className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400">
                  <Linkedin className="h-3.5 w-3.5" />
                </a>
                <a href="#" aria-label="Instagram"
                  className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400">
                  <Instagram className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Quick Links — replaces Policies */}
            <div>
              <p className="text-sm font-semibold text-zinc-900">Quick Links</p>
              <ul className="mt-5 space-y-3">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/leaderboard', label: 'Leaderboard' },
                  { href: '/add-company', label: 'Add Company' },
                  { href: '/company', label: 'Write a Review' },
                  { href: '/my-reviews', label: 'My Reviews' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-zinc-500 hover:text-zinc-900">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center">
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
