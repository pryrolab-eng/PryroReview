import Link from 'next/link'
import { Star } from 'lucide-react'

const links = {
  Platform: [
    { href: '/', label: 'Browse Businesses' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/add-company', label: 'Add a Company' },
  ],
  Account: [
    { href: '/login', label: 'Sign In' },
    { href: '/register', label: 'Create Account' },
    { href: '/my-reviews', label: 'My Reviews' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
                <Star className="h-4 w-4 fill-white text-white" />
              </div>
              <span className="text-[17px] font-bold tracking-tight text-slate-900">
                Pryro <span className="text-brand">Review</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Rwanda's verified business review platform.
              Every review is backed by a 100 RWF verification payment.
            </p>
          </div>

          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{group}</h3>
              <ul className="mt-4 space-y-2.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-slate-600 transition-colors hover:text-brand">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Pryro Review. Built for Rwanda.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
            <span className="text-xs text-slate-400">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
