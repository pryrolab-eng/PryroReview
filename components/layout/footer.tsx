import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">

        {/* ── Main row: brand left, links right ── */}
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">

          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center">
              <span className="text-[16px] font-bold tracking-tight text-slate-900">
                Pryro<span className="text-blue-600">Review</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Rwanda's verified business review platform. Every review is
              backed by a 20 RWF verification payment.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex gap-16 sm:gap-20">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Platform
              </p>
              <ul className="mt-4 space-y-3">
                {[
                  { href: '/', label: 'Browse Businesses' },
                  { href: '/leaderboard', label: 'Leaderboard' },
                  { href: '/add-company', label: 'Add a Company' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-slate-600 transition-colors hover:text-slate-900">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Account
              </p>
              <ul className="mt-4 space-y-3">
                {[
                  { href: '/login', label: 'Sign In' },
                  { href: '/register', label: 'Create Account' },
                  { href: '/my-reviews', label: 'My Reviews' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-slate-600 transition-colors hover:text-slate-900">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Pryro Review. Built for Rwanda.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-400">All systems operational</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
