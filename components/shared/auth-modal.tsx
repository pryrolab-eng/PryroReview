'use client'

import { useState, useEffect } from 'react'
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useAuthModal } from '@/lib/auth-modal-context'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const inputCls = 'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-gray-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-colors duration-200'

function Logo() {
  return (
    <div className="mb-5 flex justify-center">
      <div className="flex items-end gap-0">
        <img src="/images/pryro.png" alt="Pryro" className="h-8 w-auto object-contain rounded-lg" />
        <span className="text-sm font-semibold tracking-tight text-zinc-950 select-none">Review</span>
      </div>
    </div>
  )
}

function PasswordInput({ value, onChange, placeholder = 'Password' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} required value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={inputCls + ' pr-10'} />
      <button type="button" tabIndex={-1} onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One number', ok: /[0-9]/.test(password) },
  ]
  return (
    <div className="mt-1.5 space-y-1">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-1.5">
          {c.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-zinc-300 shrink-0" />}
          <span className={`text-[11px] ${c.ok ? 'text-green-600' : 'text-zinc-400'}`}>{c.label}</span>
        </div>
      ))}
    </div>
  )
}

function EmailInput({ value, onChange, placeholder = 'Email' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [touched, setTouched] = useState(false)
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  const showError = touched && value.length > 0 && !isValid
  return (
    <div>
      <input type="email" required value={value} onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)} placeholder={placeholder}
        className={inputCls + (showError ? ' border-red-400 focus:ring-red-400 focus:border-red-400' : '')} />
      {showError && <p className="mt-1 text-[11px] text-red-500">Please enter a valid email (e.g. you@example.com)</p>}
    </div>
  )
}

type Mode = 'login' | 'register' | 'forgot'

export function AuthModal() {
  const { isOpen, initialMode, closeAuthModal } = useAuthModal()
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  // form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')

  const [forgotError, setForgotError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode as Mode)
      setForgotSent(false)
      setForgotError('')
    }
  }, [isOpen, initialMode])

  const reset = () => {
    setEmail(''); setPassword('')
    setFullName(''); setRegEmail(''); setRegPassword('')
    setForgotEmail(''); setForgotSent(false); setForgotError('')
    setLoading(false)
  }

  const handleClose = () => { reset(); closeAuthModal() }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) { toast.error('Invalid email or password'); return }
      toast.success('Welcome back!')
      handleClose()
      window.location.reload()
    } catch { toast.error('Something went wrong.') }
    finally { setLoading(false) }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email: regEmail, password: regPassword }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to create account'); return }
      if (data.verified) {
        toast.success('Account created! Signing you in...')
        await signIn('credentials', { email: regEmail, password: regPassword, redirect: false })
        handleClose(); window.location.reload()
      } else {
        toast.success('Check your email to verify your account.')
        handleClose()
      }
    } catch { toast.error('Something went wrong.') }
    finally { setLoading(false) }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        setForgotError(data.error || 'Something went wrong.')
        return
      }
      setForgotSent(true)
    } catch { setForgotError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  const slideVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 },
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="max-w-[22rem] gap-0 rounded-[2rem] border border-zinc-200 bg-white p-0 overflow-hidden max-h-[calc(100vh-3rem)] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>{mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Forgot password'}</DialogTitle>
        </VisuallyHidden>

        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.div key="login" variants={slideVariants} initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }} className="px-6 pb-6 pt-6">
              <Logo />
              <div className="text-center">
                <h2 className="text-xl font-bold text-zinc-900">Welcome back</h2>
                <p className="mt-1 text-sm text-zinc-500">Sign in to your account</p>
              </div>
              <form onSubmit={handleLogin} className="mt-5 space-y-3">
                <EmailInput value={email} onChange={setEmail} />
                <div>
                  <PasswordInput value={password} onChange={setPassword} />
                  <div className="mt-1.5 flex justify-end">
                    <button type="button" onClick={() => { setMode('forgot'); setForgotEmail(email) }}
                      className="text-xs text-blue-600 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-zinc-900">
                Don&apos;t have an account?{' '}
                <button onClick={() => setMode('register')} className="font-semibold text-blue-600 hover:underline">Sign up</button>
              </p>
            </motion.div>
          )}

          {mode === 'register' && (
            <motion.div key="register" variants={slideVariants} initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }} className="px-6 pb-6 pt-6">
              <Logo />
              <div className="text-center">
                <h2 className="text-xl font-bold text-zinc-900">Create your account</h2>
                <p className="mt-1 text-xs text-zinc-500">Join PryroReview&apos;s verified review platform</p>
              </div>
              <form onSubmit={handleRegister} className="mt-5 space-y-3">
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name" className={inputCls} />
                <EmailInput value={regEmail} onChange={setRegEmail} />
                <div>
                  <PasswordInput value={regPassword} onChange={setRegPassword} />
                  <PasswordStrength password={regPassword} />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
                </Button>
              </form>
              <p className="mt-4 text-center text-xs text-zinc-900">
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="font-semibold text-blue-600 hover:underline">Sign in</button>
              </p>
            </motion.div>
          )}

          {mode === 'forgot' && (
            <motion.div key="forgot" variants={slideVariants} initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }} className="px-6 pb-6 pt-6">
              <Logo />
              {forgotSent ? (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900">Check your email</h2>
                  <p className="mt-2 text-xs text-zinc-500">
                    If an account exists for <strong className="text-zinc-900">{forgotEmail}</strong>, a reset link has been sent.
                  </p>
                  <button onClick={() => setMode('login')} className="mt-5 text-sm font-semibold text-blue-600 hover:underline">
                    ← Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-zinc-900">Forgot password?</h2>
                    <p className="mt-1 text-xs text-zinc-500">Enter your email and we&apos;ll send a reset link.</p>
                  </div>
                  <form onSubmit={handleForgot} className="mt-5 space-y-3">
                    <EmailInput value={forgotEmail} onChange={(v) => { setForgotEmail(v); setForgotError('') }} />
                    {forgotError && (
                      <p className="text-[11px] text-red-500 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                        {forgotError}
                      </p>
                    )}
                    <Button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white">
                      {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
                    </Button>
                  </form>
                  <p className="mt-4 text-center text-xs text-zinc-900">
                    <button onClick={() => setMode('login')} className="font-semibold text-blue-600 hover:underline">
                      ← Back to Sign In
                    </button>
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
