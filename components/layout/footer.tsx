import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">

        {/* ── Main grid: logo left | three columns right ── */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">

          {/* Left: Logo */}
          <div className="shrink-0 self-start lg:max-w-[160px]">
            <Link href="/" className="flex items-end gap-1">
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
                  'Banking', 'Telecommunications', 'Government Services',
                  'Healthcare', 'Insurance', 'Education',
                  'Transport', 'Food & Beverage', 'All Categories',
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
            </div>

            {/* Quick Links */}
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
