'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, MailCheck, AlertCircle } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

const inputCls = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-zinc-900 placeholder:text-gray-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-colors duration-200'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const verified = searchParams.get('verified') === 'true'
  const urlError = searchParams.get('error')

  const bannerError: string | null =
    urlError === 'not_verified'
      ? 'Please verify your email before signing in. Check your inbox.'
      : urlError === 'token_expired'
      ? 'Your verification link has expired. Please register again.'
      : urlError === 'token_used'
      ? 'This verification link has already been used.'
      : urlError === 'invalid_token'
      ? 'This verification link is invalid.'
      : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        if (result.error === 'not_verified') {
          toast.error('Please verify your email before signing in. Check your inbox.')
        } else {
          toast.error('Invalid email or password')
        }
        return
      }
      toast.success('Welcome back!')
      router.push(redirect)
      router.refresh()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm animate-fade-up">

        <div className="mb-8 flex justify-center">
          <div className="flex items-end gap-0">
            <img src="/images/pryro.png" alt="Pryro" className="h-8 w-auto object-contain rounded-lg" />
            <span className="text-sm font-semibold tracking-tight text-zinc-950 select-none">Review</span>
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight text-zinc-900">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-900">
          Sign in to your PryroReview account
        </p>

        {verified && (
          <div className="mt-5 flex items-center gap-3 rounded-md border border-zinc-200 bg-white p-4">
            <MailCheck className="h-5 w-5 shrink-0 text-zinc-900" />
            <p className="text-sm font-medium text-zinc-900">
              Email verified! You can now sign in.
            </p>
          </div>
        )}

        {bannerError && (
          <div className="mt-5 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <p className="text-sm font-medium text-red-600">{bannerError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1.5">Email address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className={inputCls} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1.5">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className={inputCls} placeholder="••••••••" />
          </div>
          <button
            type="submit" disabled={loading}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 text-sm font-semibold text-white hover:bg-blue-800 transition-colors duration-200 disabled:opacity-60"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-900">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-zinc-950 hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
