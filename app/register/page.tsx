'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to create account')
        return
      }

      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="animate-fade-up flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-24">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <MailCheck className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="mt-6 text-2xl font-black tracking-tight text-zinc-900">
            Check your inbox
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            We sent a verification link to{' '}
            <span className="font-medium text-zinc-900">{email}</span>.
            Click it to activate your account and start reviewing.
          </p>
          <p className="mt-4 text-xs text-zinc-400">
            The link expires in 24 hours. Check your spam folder if you don't see it.
          </p>
          <Link href="/login" className="mt-8 inline-block">
            <Button variant="outline" className="rounded-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-24">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">
          Create Account
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Join Rwanda&apos;s verified review platform.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-900">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 text-base text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-900">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 text-base text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-900">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 text-base text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-zinc-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
