'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/add-company', label: 'Add Company' },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-zinc-900">
            Pryro<span className="text-orange-500">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-900'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-zinc-100" />
          ) : user ? (
            <>
              <Link href="/my-reviews">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-zinc-500 hover:text-zinc-900"
                >
                  My Reviews
                </Button>
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-zinc-500 hover:text-zinc-900"
                  >
                    Admin
                  </Button>
                </Link>
              )}
              <Button
                size="sm"
                className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-zinc-500 hover:text-zinc-900"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-b border-zinc-100 bg-white md:hidden">
          <nav className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-medium text-zinc-700"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 border-t border-zinc-100 pt-4">
              {user ? (
                <>
                  <Link
                    href="/my-reviews"
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-sm font-medium text-zinc-700"
                  >
                    My Reviews
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 text-sm font-medium text-zinc-700"
                    >
                      Admin
                    </Link>
                  )}
                  <Button
                    className="mt-2 w-full rounded-full bg-zinc-900 text-white"
                    onClick={() => {
                      signOut()
                      setMobileOpen(false)
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full rounded-full bg-zinc-900 text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
