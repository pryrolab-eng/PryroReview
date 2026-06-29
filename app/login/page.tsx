'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, MailCheck, AlertCircle } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
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
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email before signing in. Check your inbox.')
        return
      }

      if (result?.error) {
        toast.error('Invalid email or password')
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
    <div className="animate-fade-up flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-24">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">
          Sign In
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Welcome back to Pryro Review.
        </p>

        {verified && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
            <MailCheck className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-700">
              Email verified! You can now sign in.
            </p>
          </div>
        )}

        {error && errorMessages[error] && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <p className="text-sm font-medium text-red-600">
              {errorMessages[error]}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
              placeholder="••••••••"
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
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-zinc-900 underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
