'use client'

import { useState, useEffect } from 'react'
import { Star, Phone, X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

const inputCls = 'h-11 w-full rounded-md border border-zinc-300 bg-white px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700'
const selectCls = 'h-11 w-full rounded-md border border-zinc-300 bg-white px-3.5 text-sm text-zinc-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700'

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
      <div className="absolute inset-0 bg-zinc-900/40" onClick={onClose} />
      <div className="relative w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto rounded-md border border-zinc-200 bg-white p-6">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
          <X className="h-5 w-5" />
        </button>

        {/* Step 1: Payment */}
        {step === 'payment' && (
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Write a Review</h2>
            <p className="mt-1 text-sm text-zinc-500">{companyName} · 20 RWF verification fee</p>
            <div className="mt-6">
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">MTN Mobile Number</label>
              <p className="mb-2 text-xs text-zinc-400">Must start with 078 or 079</p>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="0781234567" className={inputCls} />
            </div>
            <Button className="w-full mt-5" disabled={!phone || paying} onClick={handlePayment}>
              {paying ? <><Loader2 className="h-4 w-4 animate-spin" /> Initiating...</> : 'Pay 20 RWF via MTN MoMo'}
            </Button>
          </div>
        )}

        {/* Step 2: Processing */}
        {step === 'processing' && (
          <div className="py-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md border-2 border-blue-700">
              <Phone className="h-8 w-8 text-blue-700" />
            </div>
            <h2 className="mt-5 text-lg font-bold text-zinc-900">Check your phone</h2>
            <p className="mt-2 text-sm text-zinc-500">
              We sent a payment request to {phone}. Enter your PIN to confirm.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
              Waiting for confirmation...
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="mt-5">Cancel</Button>
          </div>
        )}

        {/* Step 3: Review form */}
        {step === 'form' && (
          <div>
            <div className="mb-5 flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2">
              <Check className="h-4 w-4 text-blue-700" />
              <span className="text-sm font-semibold text-blue-700">Payment confirmed</span>
            </div>

            <h2 className="text-lg font-bold text-zinc-900">Your Review</h2>
            <p className="mt-0.5 text-sm text-zinc-500">{companyName}</p>

            <div className="mt-5">
              <label className="block text-sm font-medium text-zinc-700 mb-2">Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}
                    className="flex h-11 w-11 items-center justify-center focus:outline-none">
                    <Star className={`h-8 w-8 ${
                      s <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-zinc-100 text-zinc-200'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Your Experience</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience..." rows={4}
                className="w-full rounded-md border border-zinc-300 bg-white p-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 resize-none" />
              <div className="mt-1 flex justify-end">
                <span className={`text-xs ${comment.length >= 50 ? 'text-blue-700 font-semibold' : 'text-zinc-400'}`}>
                  {comment.length} / 50 min
                </span>
              </div>
            </div>

            <Button className="w-full mt-4" disabled={submitting || rating === 0 || comment.length < 50} onClick={handleSubmit}>
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Review'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
