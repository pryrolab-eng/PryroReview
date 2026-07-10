'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown, LayoutDashboard, Star, LogOut, Plus } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useAuthModal } from '@/lib/auth-modal-context'
import { useAddCompanyModal } from '@/lib/add-company-modal-context'

export function Navbar() {
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { openAuthModal } = useAuthModal()
  const { openAddCompanyModal } = useAddCompanyModal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-8 px-4 sm:px-6 lg:px-10">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-end gap-0">
          <Image
            src="/images/pryro.png"
            alt="Pryro"
            width={70}
            height={28}
            className="h-7 w-auto object-contain rounded-md"
            priority
          />
          <span className="text-xs font-semibold tracking-tight text-zinc-950 select-none">
            Review
          </span>
        </Link>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button
                onClick={() => openAddCompanyModal()}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors duration-200"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                Company
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('add a company')}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors duration-200"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                Company
              </button>
            )}

            {loading ? (
              <div className="h-6 w-16 animate-pulse rounded bg-zinc-100" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-100 transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
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
                      <Star className="h-4 w-4" /> My Reviews
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" onClick={() => setProfileOpen(false)}
                        className="flex min-h-[44px] items-center gap-2.5 px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50">
                        <LayoutDashboard className="h-4 w-4" /> Admin Panel
                      </Link>
                    )}
                    <div className="mt-1 border-t border-zinc-100 pt-1">
                      <button onClick={() => { signOut(); setProfileOpen(false) }}
                        className="flex min-h-[44px] w-full items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('sign in')}
                className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition-colors duration-200"
              >
                Login
              </button>
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-zinc-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <nav className="space-y-1">
            {user ? (
              <button
                onClick={() => { setMobileOpen(false); openAddCompanyModal() }}
                className="flex items-center gap-1.5 w-full rounded-lg bg-zinc-100 px-3 py-2 text-left text-sm font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors duration-200"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                Company
              </button>
            ) : (
              <button
                onClick={() => { setMobileOpen(false); openAuthModal('add a company') }}
                className="flex items-center gap-1.5 w-full rounded-lg bg-zinc-100 px-3 py-2 text-left text-sm font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors duration-200"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                Company
              </button>
            )}
          </nav>

          <div className="mt-3 border-t border-zinc-100 pt-3">
            {user ? (
              <>
                <div className="mb-2 px-3 py-1">
                  <p className="text-xs font-semibold text-zinc-900">{user.fullName}</p>
                  <p className="text-xs text-zinc-900">{user.email}</p>
                </div>
                <Link href="/my-reviews" onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50">
                  My Reviews
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-50">
                    Admin Panel
                  </Link>
                )}
                <button onClick={() => { signOut(); setMobileOpen(false) }}
                  className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-white bg-red-600 hover:bg-red-700">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setMobileOpen(false); openAuthModal('sign in') }}
                  className="flex items-center justify-center rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors duration-200">
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
