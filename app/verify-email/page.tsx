'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, MailCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResend = async () => {
    setResending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to resend email')
        return
      }
      setResent(true)
      toast.success('Verification email sent!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm animate-fade-up text-center">

        <div className="mb-8 flex justify-center">
          <div className="flex items-end gap-0">
            <img src="/images/pryro.png" alt="Pryro" className="h-8 w-auto object-contain rounded-lg" />
            <span className="text-sm font-semibold tracking-tight text-zinc-950 select-none">Review</span>
          </div>
        </div>

        <div className="flex justify-center mb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white">
            <MailCheck className="h-6 w-6 text-zinc-900" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Check your email</h1>
        <p className="mt-3 text-sm text-zinc-500">
          We sent a verification link to your email. Click the link to activate your account.
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          The link expires in 24 hours. Check your spam folder if you don't see it.
        </p>

        <div className="mt-8 space-y-3">
          {resent ? (
            <div className="flex items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white p-3">
              <MailCheck className="h-4 w-4 text-zinc-900" />
              <p className="text-sm font-medium text-zinc-900">Email resent! Check your inbox.</p>
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 transition-colors disabled:opacity-60"
            >
              {resending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Resending...</>
              ) : (
                'Resend verification email'
              )}
            </button>
          )}

          <Link
            href="/login"
            className="block text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
