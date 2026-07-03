import Link from 'next/link'
import Image from 'next/image'

const categories = [
  'Banking',
  'Telecommunications',
  'Government Services',
  'Healthcare',
  'Insurance',
  'Education',
  'Transport',
  'Food & Beverage',
]

const companyLinks = [
  { href: '#', label: 'About PryroReview' },
  { href: '#', label: 'How It Works' },
  { href: '#', label: 'Pricing' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/add-company', label: 'Add a Company' },
]

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/add-company', label: 'Add Company' },
  { href: '/', label: 'Write a Review' },
  { href: '/my-reviews', label: 'My Reviews' },
]

export function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[200px_1fr]">

          {/* Logo + tagline */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-1 w-fit">
              <Image
                src="/images/pryro.png"
                alt="Pryro"
                width={80}
                height={32}
                className="h-7 w-auto object-contain"
                priority
              />
              <span className="text-sm font-semibold tracking-tight text-zinc-950 select-none">
                Review
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-zinc-400 max-w-[160px]">
              Verified business reviews for Rwanda.
            </p>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">

            {/* Top Categories */}
            <div>
              <p className="text-sm font-semibold text-zinc-900">Top Categories</p>
              <ul className="mt-4 space-y-2.5">
                {categories.map((cat) => (
                  <li key={cat}>
                    <Link
                      href={`/?category=${encodeURIComponent(cat)}`}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/"
                    className="text-sm font-medium text-zinc-900 hover:underline"
                  >
                    All Categories →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-sm font-semibold text-zinc-900">Company</p>
              <ul className="mt-4 space-y-2.5">
                {companyLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <p className="text-sm font-semibold text-zinc-900">Quick Links</p>
              <ul className="mt-4 space-y-2.5">
                {quickLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} PryroReview · Verified business reviews
          </p>
          <div className="flex items-center gap-5">
            {['Terms', 'Privacy', 'Cookies'].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-xs text-zinc-400 transition-colors hover:text-zinc-700"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
