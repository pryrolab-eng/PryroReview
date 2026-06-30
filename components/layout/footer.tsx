import Link from 'next/link'

const categories = [
  'Banking & Finance',
  'Telecommunications',
  'Government Services',
  'Healthcare',
  'Education',
  'Airlines & Transport',
  'Hospitality & Tourism',
  'Retail & Shopping',
]

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">

        {/* ── Main row: logo far left — links far right ── */}
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">

          {/* Logo — top left, nothing below it */}
          <div className="shrink-0">
            <Link href="/">
              <span className="text-[17px] font-bold tracking-tight text-slate-900">
                PryroReview
              </span>
            </Link>
          </div>

          {/* Link columns — pushed to the right */}
          <div className="flex flex-wrap gap-12 sm:gap-20 lg:gap-24">

            {/* Quick Links */}
            <div>
              <p className="text-sm font-semibold text-slate-900">Quick Links</p>
              <ul className="mt-5 space-y-3.5">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/leaderboard', label: 'Leaderboard' },
                  { href: '/add-company', label: 'Add Company' },
                  { href: '/my-reviews', label: 'My Reviews' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Categories */}
            <div>
              <p className="text-sm font-semibold text-slate-900">Top Categories</p>
              <ul className="mt-5 space-y-3.5">
                {categories.map((cat) => (
                  <li key={cat}>
                    <Link href={`/?category=${encodeURIComponent(cat)}`} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies */}
            <div>
              <p className="text-sm font-semibold text-slate-900">Policies</p>
              <ul className="mt-5 space-y-3.5">
                {[
                  'Community Guidelines',
                  'Terms of Use',
                  'Privacy Policy',
                  'Trust & Safety',
                ].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Pryro Review · Making Rwanda&apos;s services transparent
          </p>
          <div className="flex items-center gap-5">
            {['Terms', 'Privacy', 'Cookies'].map((item) => (
              <Link key={item} href="#" className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
