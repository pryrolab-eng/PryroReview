'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      // Always show success — never reveal if email exists
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md mx-auto px-6">

        <Link href="/login" className="inline-block mb-8 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          ← Back to Login
        </Link>

        <div className="mb-8 flex justify-center">
          <div className="flex items-end gap-0">
            <img src="/images/pryro.png" alt="Pryro" className="h-8 w-auto object-contain rounded-lg" />
            <span className="text-sm font-semibold tracking-tight text-zinc-950 select-none">Review</span>
          </div>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Check your email!</h1>
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-700">
                A reset link has been sent to <strong>{email}</strong>. Check your inbox and follow the instructions.
              </p>
            </div>
            <p className="mt-4 text-xs text-zinc-400">Didn&apos;t receive it? Check your spam folder or</p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="mt-1 text-xs text-blue-600 hover:underline"
            >
              try again with a different email
            </button>
            <div className="mt-6">
              <Link href="/login" className="text-sm font-semibold text-zinc-900 hover:underline">
                ← Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-zinc-900">Forgot your password?</h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-60"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
