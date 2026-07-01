'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown, LayoutDashboard, Star, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useAuthModal } from '@/lib/auth-modal-context'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/leaderboard', label: 'Leaderboard', requiresAuth: false },
  { href: '/add-company', label: 'Add Company', requiresAuth: true },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { openAuthModal } = useAuthModal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full bg-white transition-shadow duration-200',
      scrolled ? 'shadow-[0_1px_8px_0_rgba(0,0,0,0.08)]' : 'shadow-none'
    )}>
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">

        {/* ── Logo ── */}
        <Link href="/" className="shrink-0">
          <span className="text-2xl font-bold tracking-tight text-zinc-950 select-none" style={{ fontFamily: "'Dancing Script', cursive" }}>
            PryroReview
          </span>
        </Link>

        {/* ── Nav links (desktop) ── */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            link.requiresAuth && !user ? (
              <button
                key={link.href}
                onClick={() => openAuthModal('add a company')}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-900 hover:text-zinc-950"
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium',
                  pathname === link.href
                    ? 'text-zinc-950 font-semibold'
                    : 'text-zinc-900 hover:text-zinc-950'
                )}
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        {/* ── Right side ── */}
        <div className="ml-auto flex items-center gap-3">

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="h-7 w-20 animate-pulse rounded bg-zinc-100" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex h-9 items-center gap-2 rounded-full border border-zinc-200 px-3 text-sm font-medium text-zinc-900 hover:border-zinc-400"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                    {(user.fullName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.fullName || user.email}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-900" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
                    <div className="border-b border-zinc-100 px-4 py-2.5">
                      <p className="truncate text-xs font-semibold text-zinc-900">{user.fullName}</p>
                      <p className="truncate text-xs text-zinc-900">{user.email}</p>
                    </div>
                    <Link href="/my-reviews" onClick={() => setProfileOpen(false)}
                      className="flex min-h-[44px] items-center gap-2.5 px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50">
                      <Star className="h-4 w-4 text-zinc-900" /> My Reviews
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" onClick={() => setProfileOpen(false)}
                        className="flex min-h-[44px] items-center gap-2.5 px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50">
                        <LayoutDashboard className="h-4 w-4 text-zinc-900" /> Admin Panel
                      </Link>
                    )}
                    <div className="mt-1 border-t border-zinc-100 pt-1">
                      <button onClick={() => { signOut(); setProfileOpen(false) }}
                        className="flex min-h-[44px] w-full items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/register"
                className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700">
                Sign up
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-900 hover:bg-zinc-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="border-t border-zinc-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              link.requiresAuth && !user ? (
                <button
                  key={link.href}
                  onClick={() => { setMobileOpen(false); openAuthModal('add a company') }}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-900 hover:bg-zinc-50 hover:text-zinc-950"
                >
                  {link.label}
                </button>
              ) : (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block rounded-md px-3 py-2 text-sm font-medium',
                    pathname === link.href
                      ? 'font-semibold text-zinc-950 bg-zinc-50'
                      : 'text-zinc-900 hover:bg-zinc-50 hover:text-zinc-950'
                  )}>
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          <div className="mt-3 border-t border-zinc-100 pt-3">
            {user ? (
              <>
                <div className="mb-2 px-3 py-1">
                  <p className="text-xs font-semibold text-zinc-900">{user.fullName}</p>
                  <p className="text-xs text-zinc-900">{user.email}</p>
                </div>
                <Link href="/my-reviews" onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50">My Reviews</Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50">Admin Panel</Link>
                )}
                <button onClick={() => { signOut(); setMobileOpen(false) }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/register" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700">
                  Sign up
                </Link>
                <p className="text-center text-xs text-zinc-900">
                  Already have an account?{' '}
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="font-medium text-zinc-900 hover:underline">Login</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
