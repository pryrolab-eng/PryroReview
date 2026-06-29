'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, MailCheck, AlertCircle, Star } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const verified = searchParams.get('verified') === 'true'
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    invalid_token: 'This verification link is invalid.',
    token_used: 'This verification link has already been used.',
    token_expired: 'This verification link has expired. Please register again.',
    server_error: 'Something went wrong. Please try again.',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email before signing in. Check your inbox.')
        return
      }
      if (result?.error) { toast.error('Invalid email or password'); return }
      toast.success('Welcome back!')
      router.push(redirect)
      router.refresh()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm animate-fade-up">

        {/* Logo mark */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand shadow-card-md">
            <Star className="h-6 w-6 fill-white text-white" />
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-slate-500">Sign in to your Pryro Review account</p>

        {verified && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <MailCheck className="h-5 w-5 shrink-0 text-blue-600" />
            <p className="text-sm font-medium text-blue-700">Email verified! You can now sign in.</p>
          </div>
        )}
        {error && errorMessages[error] && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <p className="text-sm font-medium text-red-600">{errorMessages[error]}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-brand hover:text-brand-dark">Create one free</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
