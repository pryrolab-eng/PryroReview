'use client'

import { useState, useEffect } from 'react'
import { Star, Phone, X, Check, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

interface ReviewModalProps {
  companyId: string
  companySlug: string
  companyName: string
  open: boolean
  onClose: () => void
  onSubmitted: () => void
}

type Step = 'payment' | 'processing' | 'form'

const categories = [
  'Staff Attitude',
  'Speed of Service',
  'Problem Resolution',
  'Facility Condition',
  'Overall Experience',
]

const inputCls = 'h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
const selectCls = 'h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
const btnPrimary = 'flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50'

export function ReviewModal({ companyId, companySlug, companyName, open, onClose, onSubmitted }: ReviewModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('payment')
  const [phone, setPhone] = useState('')
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [referenceId, setReferenceId] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [category, setCategory] = useState('Overall Experience')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (open) {
      setStep('payment'); setPhone(''); setPaymentId(null); setReferenceId(null)
      setRating(0); setHoverRating(0); setCategory('Overall Experience'); setComment('')
    }
  }, [open])

  if (!open) return null

  const handlePayment = async () => {
    if (!phone) { toast.error('Enter your MTN phone number'); return }
    if (!user) return
    setPaying(true)
    try {
      const res = await fetch('/api/payments/mtn/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, companyId, companyName }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Payment failed to initiate'); return }
      setPaymentId(data.paymentId); setReferenceId(data.referenceId); setStep('processing')
      const poll = setInterval(async () => {
        try {
          const s = await fetch(`/api/payments/mtn/status/${data.referenceId}`)
          const sd = await s.json()
          if (sd.status === 'confirmed') { clearInterval(poll); setStep('form'); setPaying(false) }
          else if (sd.status === 'failed') { clearInterval(poll); toast.error('Payment failed.'); setStep('payment'); setPaying(false) }
        } catch {}
      }, 2000)
      setTimeout(() => clearInterval(poll), 30000)
    } catch { toast.error('Payment failed to initiate.'); setPaying(false) }
  }

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return }
    if (comment.length < 50) { toast.error('Comment must be at least 50 characters'); return }
    if (!user || !paymentId) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, paymentId, rating, category, comment }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to submit review'); return }
      toast.success('Review submitted')
      onSubmitted(); onClose()
    } catch { toast.error('Failed to submit review.') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto animate-scale-in rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <X className="h-5 w-5" />
        </button>

        {/* ── Step 1: Payment ── */}
        {step === 'payment' && (
          <div>
            <h2 className="text-lg font-bold text-slate-900">Write a Review</h2>
            <p className="mt-1 text-sm text-slate-500">{companyName} · 20 RWF verification fee</p>
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">MTN Mobile Number</label>
              <p className="mb-2 text-xs text-slate-400">Must start with 078 or 079</p>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="0781234567" className={inputCls} />
            </div>
            <button onClick={handlePayment} disabled={!phone || paying} className={`mt-5 ${btnPrimary}`}>
              {paying ? <><Loader2 className="h-4 w-4 animate-spin" /> Initiating...</> : 'Pay 20 RWF via MTN MoMo'}
            </button>
          </div>
        )}

        {/* ── Step 2: Processing ── */}
        {step === 'processing' && (
          <div className="py-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="mt-5 text-lg font-bold text-slate-900">Check your phone</h2>
            <p className="mt-2 text-sm text-slate-500">
              We sent a payment request to {phone}. Enter your PIN to confirm.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              Waiting for confirmation...
            </div>
            <button onClick={onClose} className="mt-5 text-sm text-slate-400 hover:text-slate-700">
              Cancel
            </button>
          </div>
        )}

        {/* ── Step 3: Review form ── */}
        {step === 'form' && (
          <div>
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
              <Check className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Payment confirmed</span>
            </div>

            <h2 className="text-lg font-bold text-slate-900">Your Review</h2>
            <p className="mt-0.5 text-sm text-slate-500">{companyName}</p>

            {/* Star rating */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}
                    className="flex h-11 w-11 items-center justify-center transition-transform hover:scale-110 focus:outline-none">
                    <Star className={`h-8 w-8 transition-colors ${
                      s <= (hoverRating || rating)
                        ? 'fill-blue-600 text-blue-600'
                        : 'fill-slate-100 text-slate-200'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Comment */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Experience</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience..." rows={4}
                className="w-full rounded-lg border border-slate-200 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
              <div className="mt-1 flex justify-end">
                <span className={`text-xs ${comment.length >= 50 ? 'text-blue-600' : 'text-slate-400'}`}>
                  {comment.length} / 50 min
                </span>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={submitting || rating === 0 || comment.length < 50}
              className={`mt-4 ${btnPrimary}`}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Review'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
