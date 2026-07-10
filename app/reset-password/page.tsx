'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

function getStrength(pw: string): { label: string; color: string; width: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' }
  if (score <= 3) return { label: 'Medium', color: 'bg-yellow-400', width: 'w-2/4' }
  return { label: 'Strong', color: 'bg-green-500', width: 'w-full' }
}

function ResetForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const strength = getStrength(password)
  const mismatch = confirm.length > 0 && password !== confirm

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-500 mb-4">Invalid reset link. The token is missing.</p>
        <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline">
          Request a new reset link →
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to reset password')
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login?reset=true'), 2000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-700">
            Password reset! Redirecting to login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-zinc-900">Set a new password</h1>
      <p className="mt-2 text-sm text-gray-500">
        Choose a strong password for your PryroReview account.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-900 mb-1.5">New Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          {password.length > 0 && (
            <div className="mt-2">
              <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
              </div>
              <p className={`mt-1 text-xs font-medium ${
                strength.label === 'Weak' ? 'text-red-500' :
                strength.label === 'Medium' ? 'text-yellow-500' : 'text-green-600'
              }`}>
                {strength.label} password
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-900 mb-1.5">Confirm Password</label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className={`w-full border rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
              mismatch ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {mismatch && (
            <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
            <p className="text-sm text-red-600">{error}</p>
            {error.toLowerCase().includes('expired') || error.toLowerCase().includes('invalid') ? (
              <Link href="/forgot-password" className="mt-1 inline-block text-xs font-semibold text-red-600 underline">
                Request a new reset link
              </Link>
            ) : null}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || mismatch}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-60"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting...</> : 'Reset Password'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
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

        <Suspense fallback={<div className="text-center text-sm text-zinc-400">Loading...</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}
