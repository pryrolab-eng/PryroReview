'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useAuthModal } from '@/lib/auth-modal-context'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const inputCls = 'h-11 w-full rounded-md border border-zinc-300 bg-white px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950'

export function AuthModal() {
  const { isOpen, closeAuthModal } = useAuthModal()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const reset = () => {
    setEmail(''); setPassword('')
    setFullName(''); setRegEmail(''); setRegPassword('')
    setLoading(false)
  }

  const handleClose = () => {
    reset()
    closeAuthModal()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) { toast.error('Invalid email or password'); return }
      toast.success('Welcome back!')
      handleClose()
      router.refresh()
    } catch {
      toast.error('Something went wrong.')
    } finally { setLoading(false) }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email: regEmail, password: regPassword }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to create account'); return }
      if (data.verified) {
        toast.success('Account created! Signing you in...')
        await signIn('credentials', { email: regEmail, password: regPassword, redirect: false })
        handleClose()
        router.refresh()
      } else {
        toast.success('Check your email to verify your account.')
        handleClose()
      }
    } catch {
      toast.error('Something went wrong.')
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="max-w-sm gap-0 rounded-md border border-zinc-200 bg-white p-0 [&>button]:hidden">

        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-8 pb-8 pt-8">

          {mode === 'login' && (
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold text-zinc-900">Welcome back</h2>
                <p className="mt-1 text-sm text-zinc-900">Sign in to your account</p>
              </div>
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-900">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-900">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" className={inputCls} />
                </div>
                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
                </Button>
              </form>
              <p className="mt-5 text-center text-sm text-zinc-900">
                Don&apos;t have an account?{' '}
                <button onClick={() => setMode('register')} className="font-semibold text-zinc-950 hover:underline">
                  Sign up
                </button>
              </p>
            </>
          )}

          {mode === 'register' && (
            <>
              <div className="mb-6 flex justify-center">
                <span className="text-2xl font-extrabold tracking-tight text-zinc-950 select-none">PryroReview</span>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-zinc-900">Create your account</h2>
                <p className="mt-1 text-sm text-zinc-900">Join PryroReview&apos;s verified review platform</p>
              </div>
              <form onSubmit={handleRegister} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-900">Full Name</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-900">Email address</label>
                  <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-900">Password</label>
                  <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number" className={inputCls} />
                </div>
                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
                </Button>
              </form>
              <p className="mt-5 text-center text-sm text-zinc-900">
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="font-semibold text-blue-700 hover:underline">
                  Sign in
                </button>
              </p>
            </>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}
