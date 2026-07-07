'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const inputCls = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-zinc-900 placeholder:text-gray-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-colors duration-200'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

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
      toast.success(`Thanks for signing up, ${fullName.split(' ')[0]}! Check your email to verify your account.`, {
        description: 'Click the link we sent to activate your account.',
        duration: 6000,
      })
      router.push('/verify-email')
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

        <h1 className="text-center text-2xl font-bold tracking-tight text-zinc-900">Create your account</h1>
        <p className="mt-2 text-center text-sm text-zinc-900">Join PryroReview&apos;s verified review platform</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1.5">Full Name</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
              className={inputCls} placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1.5">Email address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className={inputCls} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1.5">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className={inputCls} placeholder="Min 8 chars, 1 uppercase, 1 number" />
          </div>
          <button
            type="submit" disabled={loading}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 text-sm font-semibold text-white hover:bg-blue-800 transition-colors duration-200 disabled:opacity-60"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-900">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-zinc-900 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
