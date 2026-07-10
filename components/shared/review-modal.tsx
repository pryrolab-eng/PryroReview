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

export function ReviewModal({ companyId, companySlug, companyName, open, onClose, onSubmitted }: ReviewModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('payment')
  const [phone, setPhone] = useState('')
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [category, setCategory] = useState('Overall Experience')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (open) {
      setStep('payment'); setPhone(''); setPaymentId(null)
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
      if (!res.ok) { toast.error(data.error || 'Payment failed to initiate'); setPaying(false); return }
      setPaymentId(data.paymentId)
      setStep('processing')
      const poll = setInterval(async () => {
        try {
          const s = await fetch(`/api/payments/mtn/status/${data.referenceId}`)
          const sd = await s.json()
          if (sd.status === 'confirmed') { clearInterval(poll); setStep('form'); setPaying(false) }
          else if (sd.status === 'failed') { clearInterval(poll); toast.error('Payment failed.'); setStep('payment'); setPaying(false) }
        } catch {}
      }, 2000)
      setTimeout(() => { clearInterval(poll); setPaying(false) }, 30000)
    } catch { toast.error('Payment failed to initiate.'); setPaying(false) }
  }

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return }
    if (comment.trim().length < 1) { toast.error('Please write a review'); return }
    if (!user || !paymentId) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, paymentId, rating, category, comment }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to submit review'); return }
      toast.success('Review submitted!')
      onSubmitted(); onClose()
    } catch { toast.error('Failed to submit review.') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-[2rem] bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              {step === 'payment' && 'Verify to Review'}
              {step === 'processing' && 'Processing Payment'}
              {step === 'form' && 'Write Your Review'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">{companyName}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-gray-100 hover:text-zinc-700 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 px-8 py-3 bg-gray-50 border-b border-gray-100">
          {(['payment', 'processing', 'form'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                step === s ? 'bg-blue-500 text-white' :
                (step === 'form' || (step === 'processing' && i === 0)) ? 'bg-blue-100 text-blue-500' :
                'bg-gray-200 text-gray-400'
              }`}>
                {step === 'form' && i < 2 ? <Check className="h-3 w-3" /> :
                 step === 'processing' && i === 0 ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`text-xs ${step === s ? 'text-zinc-700 font-medium' : 'text-zinc-400'}`}>
                {s === 'payment' ? 'Pay' : s === 'processing' ? 'Confirm' : 'Review'}
              </span>
              {i < 2 && <div className="w-4 h-px bg-gray-300 mx-0.5" />}
            </div>
          ))}
        </div>

        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">

          {/* -- Step 1: Payment -- */}
          {step === 'payment' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-white p-4">
                <p className="text-sm font-semibold text-zinc-900">20 RWF verification fee</p>
                <p className="text-xs text-zinc-600 mt-0.5">Paid via MTN MoMo to prevent fake reviews</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">MTN Mobile Number</label>
                <p className="mb-2 text-xs text-zinc-400">Must start with 078 or 079</p>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0781234567"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-zinc-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
              <button
                type="button"
                onClick={handlePayment}
                disabled={!phone || paying}
                className="w-full h-8 rounded-lg bg-blue-500 text-sm font-semibold text-white hover:bg-blue-600 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paying ? <><Loader2 className="h-4 w-4 animate-spin" /> Initiating...</> : 'Pay 20 RWF'}
              </button>
            </div>
          )}

          {/* -- Step 2: Processing -- */}
          {step === 'processing' && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
                <Phone className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Check your phone</p>
                <p className="text-sm text-zinc-400 mt-1">
                  Approve the payment request sent to <span className="font-medium text-zinc-700">{phone}</span>
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                Waiting for confirmation...
              </div>
              <button onClick={onClose} className="text-xs text-zinc-400 hover:text-zinc-600">Cancel</button>
            </div>
          )}

          {/* -- Step 3: Review form -- */}
          {step === 'form' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-xl bg-blue-500 px-3 py-2">
                <Check className="h-4 w-4 text-white shrink-0" />
                <span className="text-xs font-semibold text-white">Payment confirmed</span>
              </div>

              {/* Stars */}
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">Your Rating <span className="text-zinc-400 font-normal">(optional)</span></label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}
                      className="flex h-7 w-7 items-center justify-center focus:outline-none">
                      <Star className={`h-6 w-6 transition-colors ${
                        s <= (hoverRating || rating) ? 'fill-blue-500 text-blue-500' : 'fill-zinc-200 text-zinc-300'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Your Review</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..." rows={4}
                  className="w-full rounded-lg border border-slate-200 bg-white p-4 text-sm text-zinc-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-200" />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || comment.trim().length < 1}
                className="w-full h-8 rounded-lg bg-blue-500 text-sm font-semibold text-white hover:bg-blue-600 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Review'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
