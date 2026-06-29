'use client'

import { useState, useEffect } from 'react'
import { Star, Phone, X, Check, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
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

export function ReviewModal({
  companyId,
  companySlug,
  companyName,
  open,
  onClose,
  onSubmitted,
}: ReviewModalProps) {
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
      setStep('payment')
      setPhone('')
      setPaymentId(null)
      setReferenceId(null)
      setRating(0)
      setHoverRating(0)
      setCategory('Overall Experience')
      setComment('')
    }
  }, [open])

  if (!open) return null

  const handlePayment = async () => {
    if (!phone) {
      toast.error('Enter your MTN phone number')
      return
    }
    if (!user) return

    setPaying(true)
    try {
      const res = await fetch('/api/payments/mtn/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, companyId, companyName }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Payment failed to initiate')
        return
      }

      setPaymentId(data.paymentId)
      setReferenceId(data.referenceId)
      setStep('processing')

      // Poll for payment status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `/api/payments/mtn/status/${data.referenceId}`
          )
          const statusData = await statusRes.json()

          if (statusData.status === 'confirmed') {
            clearInterval(pollInterval)
            setStep('form')
            setPaying(false)
          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval)
            toast.error('Payment failed. Please try again.')
            setStep('payment')
            setPaying(false)
          }
        } catch {
          // Keep polling
        }
      }, 2000)

      // Auto-confirm after 10s in sandbox mode
      setTimeout(() => clearInterval(pollInterval), 30000)
    } catch {
      toast.error('Payment failed to initiate. Please try again.')
      setPaying(false)
    }
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    if (comment.length < 50) {
      toast.error('Comment must be at least 50 characters')
      return
    }
    if (!user || !paymentId) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          paymentId,
          rating,
          category,
          comment,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit review')
        return
      }

      toast.success('Review submitted successfully')
      onSubmitted()
      onClose()
    } catch {
      toast.error('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-zinc-100 bg-white p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 transition-colors hover:text-zinc-900"
        >
          <X className="h-5 w-5" />
        </button>

        {step === 'payment' && (
          <div>
            <h2 className="text-xl font-black tracking-tight">
              Write a Review
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {companyName} · 100 RWF verification fee
            </p>

            <div className="mt-6">
              <label className="text-sm font-medium text-zinc-900">
                MTN Mobile Number
              </label>
              <p className="mt-1 text-xs text-zinc-400">
                Must start with 078 or 079
              </p>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0781234567"
                className="mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 text-base text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none"
              />
            </div>

            <Button
              onClick={handlePayment}
              disabled={!phone || paying}
              className="mt-6 h-12 w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {paying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initiating...
                </>
              ) : (
                'Pay 100 RWF via MTN MoMo'
              )}
            </Button>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-orange-50">
              <Phone className="h-10 w-10 text-orange-500" />
            </div>
            <h2 className="mt-6 text-xl font-black tracking-tight">
              Check your phone
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              We sent a payment request to {phone}. Enter your PIN to confirm.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Waiting for confirmation...
            </div>
            <button
              onClick={onClose}
              className="mt-6 text-sm text-zinc-500 underline hover:text-zinc-900"
            >
              Cancel
            </button>
          </div>
        )}

        {step === 'form' && (
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-emerald-600">
                Payment confirmed
              </span>
            </div>
            <h2 className="mt-4 text-xl font-black tracking-tight">
              Your Review
            </h2>
            <p className="mt-1 text-sm text-zinc-500">{companyName}</p>

            <div className="mt-6">
              <label className="text-sm font-medium text-zinc-900">
                Rating
              </label>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoverRating || rating)
                          ? 'fill-orange-500 text-orange-500'
                          : 'fill-zinc-100 text-zinc-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-zinc-900">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 text-base text-zinc-900 transition-colors focus:border-zinc-900 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-zinc-900">
                Your Experience
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience..."
                rows={4}
                className="mt-2 w-full rounded-xl border border-zinc-200 p-4 text-base text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none"
              />
              <div className="mt-1 flex justify-end">
                <span
                  className={`text-xs ${
                    comment.length >= 50 ? 'text-emerald-600' : 'text-zinc-400'
                  }`}
                >
                  {comment.length} / 50 min
                </span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0 || comment.length < 50}
              className="mt-6 h-12 w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
