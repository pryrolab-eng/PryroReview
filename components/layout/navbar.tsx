'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown, LayoutDashboard, Star, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { AuthGateModal } from '@/components/shared/auth-gate-modal'

const navLinks = [
  { href: '/leaderboard', label: 'Leaderboard', requiresAuth: false },
  { href: '/add-company', label: 'Add Company', requiresAuth: true },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  const lastScrollY = useRef(0)
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current !== null) return
      rafId.current = requestAnimationFrame(() => {
        const current = window.scrollY
        const delta = current - lastScrollY.current
        if (current === 0) setCompact(false)
        else if (delta > 10) setCompact(true)
        else if (delta < -10) setCompact(false)
        lastScrollY.current = current
        rafId.current = null
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    }
  }, [])

  return (
    <div className="sticky top-0 z-50 flex justify-center px-4 pt-3 pb-2 sm:px-6 lg:px-8">
      {/* ── Floating pill container ── */}
      <header
        className={cn(
          'w-full max-w-5xl rounded-full bg-white shadow-[0_2px_20px_0_rgba(0,0,0,0.08)] transition-all duration-300 ease-in-out',
          compact ? 'py-1.5 px-4 sm:px-5' : 'py-2.5 px-5 sm:px-6'
        )}
      >
        <div className="flex items-center gap-6">

          {/* ── Logo ── */}
          <Link href="/" className="shrink-0">
            <span
              className={cn(
                'font-bold tracking-tight text-slate-900 transition-all duration-300',
                compact ? 'text-sm' : 'text-[16px]'
              )}
            >
              PryroReview
            </span>
          </Link>

          {/* ── Nav links (desktop, centered) ── */}
          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {navLinks.map((link) => (
              link.requiresAuth && !user ? (
                <button
                  key={link.href}
                  onClick={() => setAuthOpen(true)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm transition-colors font-normal text-slate-500 hover:text-slate-900'
                  )}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm transition-colors',
                    pathname === link.href
                      ? 'font-semibold text-slate-900'
                      : 'font-normal text-slate-500 hover:text-slate-900'
                  )}
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* ── Right: Auth (desktop) ── */}
          <div className="ml-auto hidden items-center gap-2 md:flex shrink-0">
            {loading ? (
              <div className="h-7 w-20 animate-pulse rounded-full bg-slate-100" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex h-8 items-center gap-2 rounded-full border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                    {(user.fullName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.fullName || user.email}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 bg-white py-1 shadow-lg">
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
                  className="flex h-8 items-center rounded-full px-4 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
                  Login
                </Link>
                <Link href="/register"
                  className="flex h-8 items-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-700">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ── Auth gate modal ── */}
      <AuthGateModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        action="add a company"
      />

      {/* ── Mobile menu (outside pill, below it) ── */}
      {mobileOpen && (
        <div className="absolute left-4 right-4 top-[calc(100%-4px)] mt-1 rounded-2xl border border-slate-100 bg-white py-3 shadow-lg sm:left-6 sm:right-6">
          <nav className="space-y-0.5 px-3">
            {navLinks.map((link) => (
              link.requiresAuth && !user ? (
                <button
                  key={link.href}
                  onClick={() => { setMobileOpen(false); setAuthOpen(true) }}
                  className="block w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                >
                  {link.label}
                </button>
              ) : (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block rounded-xl px-3 py-2.5 text-sm font-medium',
                    pathname === link.href ? 'font-semibold text-slate-900 bg-slate-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  )}>
                  {link.label}
                </Link>
              )
            ))}
          </nav>
          <div className="mt-2 border-t border-slate-100 px-3 pt-2">
            {user ? (
              <>
                <div className="mb-2 px-3 py-1">
                  <p className="text-xs font-semibold text-slate-900">{user.fullName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <Link href="/my-reviews" onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">My Reviews</Link>
                {user.role === 'ADMIN' && <Link href="/admin" onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">Admin Panel</Link>}
                <button onClick={() => { signOut(); setMobileOpen(false) }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-50">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-0 pt-1">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">Login</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
