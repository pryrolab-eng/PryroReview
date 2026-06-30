'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, ChevronDown, LayoutDashboard, Star, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/add-company', label: 'Add Company' },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-10">

        {/* ── Left: Logo + Nav ── */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center shrink-0">
            <span className="text-[17px] font-bold tracking-tight text-slate-900">
              Pryro<span className="text-blue-600">Review</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Right: Auth (desktop) ── */}
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {(user.fullName || user.email || 'U')[0].toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{user.fullName || user.email}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-slate-100 px-4 py-2.5">
                    <p className="truncate text-xs font-semibold text-slate-900">{user.fullName}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Link href="/my-reviews" onClick={() => setProfileOpen(false)}
                    className="flex min-h-[44px] items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Star className="h-4 w-4 text-slate-400" /> My Reviews
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" onClick={() => setProfileOpen(false)}
                      className="flex min-h-[44px] items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <LayoutDashboard className="h-4 w-4 text-slate-400" /> Admin Panel
                    </Link>
                  )}
                  <div className="mt-1 border-t border-slate-100 pt-1">
                    <button onClick={() => { signOut(); setProfileOpen(false) }}
                      className="flex min-h-[44px] w-full items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login"
                className="flex h-11 items-center rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
                Sign In
              </Link>
              <Link href="/register"
                className="flex h-11 items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="border-b border-slate-200 bg-white md:hidden">
          <nav className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className={cn(
                  'block min-h-[44px] rounded-lg px-3 py-2.5 text-sm font-medium',
                  pathname === link.href ? 'text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                )}>
                {link.label}
              </Link>
            ))}
            <div className="mt-3 border-t border-slate-100 pt-3">
              {user ? (
                <>
                  <div className="mb-2 px-3 py-1">
                    <p className="text-xs font-semibold text-slate-900">{user.fullName}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Link href="/my-reviews" onClick={() => setMobileOpen(false)} className="block min-h-[44px] rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">My Reviews</Link>
                  {user.role === 'ADMIN' && <Link href="/admin" onClick={() => setMobileOpen(false)} className="block min-h-[44px] rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">Admin Panel</Link>}
                  <button onClick={() => { signOut(); setMobileOpen(false) }} className="mt-1 flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex min-h-[44px] items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">Sign In</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Get Started</Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
