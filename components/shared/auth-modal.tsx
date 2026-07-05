'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useAuthModal } from '@/lib/auth-modal-context'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const inputCls = 'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-gray-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-colors duration-200'

export function AuthModal() {
  const { isOpen, initialMode, closeAuthModal } = useAuthModal()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Sync mode when modal opens
  useEffect(() => {
    if (isOpen) setMode(initialMode)
  }, [isOpen, initialMode])

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
      // Force a full page refresh so useSession picks up the new cookie immediately
      window.location.reload()
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
        window.location.reload()
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
      <DialogContent className="max-w-[22rem] gap-0 rounded-[2rem] border border-zinc-200 bg-white p-0">
        <VisuallyHidden>
          <DialogTitle>{mode === 'login' ? 'Sign in to your account' : 'Create your account'}</DialogTitle>
        </VisuallyHidden>

        <div className="px-6 pb-6 pt-6">

          {mode === 'login' && (
            <>
              <div className="text-center">
                <h2 className="text-xl font-bold text-zinc-900">Welcome back</h2>
                <p className="mt-1 text-sm text-zinc-900">Sign in to your account</p>
              </div>
              <form onSubmit={handleLogin} className="mt-6 space-y-3">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email" className={inputCls} />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" className={inputCls} />
                <Button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white" size="default">
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
                <div className="flex items-end gap-1">
                  <img src="/images/pryro.png" alt="Pryro" className="h-8 w-auto object-contain rounded-lg" />
                  <span className="text-sm font-semibold tracking-tight text-zinc-950 select-none">Review</span>
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-zinc-900">Create your account</h2>
                <p className="mt-1 text-xs text-zinc-900">Join PryroReview&apos;s verified review platform</p>
              </div>
              <form onSubmit={handleRegister} className="mt-6 space-y-3">
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name" className={inputCls} />
                <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Email" className={inputCls} />
                <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Password" className={inputCls} />
                <Button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white" size="default">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
                </Button>
              </form>
              <p className="mt-5 text-center text-xs text-zinc-900">
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="font-semibold text-blue-500 hover:underline">
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
