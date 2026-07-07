'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthModal } from '@/lib/auth-modal-context'
import { MailCheck, AlertCircle } from 'lucide-react'

function LoginRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { openAuthModal } = useAuthModal()

  const verified = searchParams.get('verified') === 'true'
  const resetSuccess = searchParams.get('reset') === 'true'
  const callbackUrl = searchParams.get('callbackUrl') || searchParams.get('redirect') || '/'
  const urlError = searchParams.get('error')

  useEffect(() => {
    // Small delay so the modal context is ready
    const timer = setTimeout(() => {
      openAuthModal('sign in', 'login')
    }, 100)
    return () => clearTimeout(timer)
  }, [openAuthModal])

  // If there are special params (verified, reset, error) show them briefly
  // before the modal opens, otherwise just redirect to home
  if (!verified && !resetSuccess && !urlError) {
    return null
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        {verified && (
          <div className="flex items-center gap-3 rounded-md border border-green-200 bg-green-50 p-4">
            <MailCheck className="h-5 w-5 shrink-0 text-green-600" />
            <p className="text-sm font-medium text-green-700">Email verified! You can now sign in.</p>
          </div>
        )}
        {resetSuccess && (
          <div className="flex items-center gap-3 rounded-md border border-green-200 bg-green-50 p-4">
            <MailCheck className="h-5 w-5 shrink-0 text-green-600" />
            <p className="text-sm font-medium text-green-700">Password reset successful. Please sign in.</p>
          </div>
        )}
        {urlError === 'not_verified' && (
          <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <p className="text-sm font-medium text-red-600">Please verify your email before signing in.</p>
          </div>
        )}
        <p className="text-center text-sm text-zinc-400">Opening sign in...</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginRedirect />
    </Suspense>
  )
}
