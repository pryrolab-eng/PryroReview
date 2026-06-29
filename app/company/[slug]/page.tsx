'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Flag,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { StarRating } from '@/components/shared/star-rating'
import { ReviewModal } from '@/components/shared/review-modal'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface ReviewUser {
  id: string
  fullName: string
}

interface Review {
  id: string
  rating: number
  category: string
  comment: string
  response: string | null
  createdAt: string
  user: ReviewUser
}

interface CompanyData {
  id: string
  name: string
  slug: string
  category: string
  district: string
  website: string | null
  description: string | null
  verified: boolean
  reviews: Review[]
  avgRating: number
  totalReviews: number
  ratingBreakdown: { star: number; count: number }[]
  categoryScores: { category: string; avgRating: number; count: number }[]
  claims: { userId: string; fullName: string }[]
}

export default function CompanyProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user } = useAuth()

  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [claimOpen, setClaimOpen] = useState(false)
  const [flaggedReviews, setFlaggedReviews] = useState<Set<string>>(new Set())
  const [responseText, setResponseText] = useState<Record<string, string>>({})
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [claimSubmitting, setClaimSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/companies/${slug}`)
      if (!res.ok) {
        setLoading(false)
        return
      }
      const data = await res.json()
      setCompany(data)

      // Load flagged reviews from localStorage
      const stored = localStorage.getItem(`flagged-${data.id}`)
      if (stored) {
        setFlaggedReviews(new Set(JSON.parse(stored)))
      }
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('review') === 'true' && user) {
      setModalOpen(true)
      window.history.replaceState({}, '', `/company/${slug}`)
    }
  }, [user, slug])

  const handleWriteReview = () => {
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/company/${slug}?review=true`)}`
      )
      return
    }
    setModalOpen(true)
  }

  const handleFlag = async (reviewId: string) => {
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/company/${slug}`)}`
      )
      return
    }
    try {
      const res = await fetch('/api/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, reason: 'Inappropriate content' }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to flag review')
        return
      }

      const newFlagged = new Set(flaggedReviews)
      newFlagged.add(reviewId)
      setFlaggedReviews(newFlagged)
      if (company) {
        localStorage.setItem(
          `flagged-${company.id}`,
          JSON.stringify(Array.from(newFlagged))
        )
      }
      toast.success('Review flagged for moderation')
    } catch {
      toast.error('Failed to flag review')
    }
  }

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !company) return
    setClaimSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          fullName: formData.get('fullName') as string,
          businessEmail: formData.get('businessEmail') as string,
          regNumber: formData.get('regNumber') as string,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit claim')
        return
      }

      toast.success('Claim submitted. An admin will review it shortly.')
      setClaimOpen(false)
    } catch {
      toast.error('Failed to submit claim')
    } finally {
      setClaimSubmitting(false)
    }
  }

  const handleResponse = async (reviewId: string) => {
    if (!user || !company) return
    const text = responseText[reviewId]
    if (!text) return

    try {
      const res = await fetch(`/api/reviews/${reviewId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: text }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to add response')
        return
      }

      toast.success('Response added')
      setRespondingTo(null)
      setResponseText({ ...responseText, [reviewId]: '' })
      loadData()
    } catch {
      toast.error('Failed to add response')
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
        <div className="mt-4 h-4 w-32 animate-pulse rounded bg-zinc-100" />
        <div className="mt-12 h-32 animate-pulse rounded-xl bg-zinc-100" />
        <div className="mt-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-zinc-100" />
          ))}
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-black">Company not found</h1>
        <p className="mt-2 text-sm text-zinc-500">
          This company doesn&apos;t exist or has been removed.
        </p>
        <Link href="/">
          <Button variant="outline" className="mt-6 rounded-full">
            Back to Home
          </Button>
        </Link>
      </div>
    )
  }

  const approvedClaim = company.claims?.[0]
  const canRespond =
    user &&
    (user.role === 'ADMIN' || approvedClaim?.userId === user.id)

  return (
    <div className="animate-fade-up">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        {/* Header */}
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                {company.name}
              </h1>
              {company.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
              <span>{company.category}</span>
              <span className="text-zinc-300">·</span>
              <span>{company.district}</span>
              {company.website && (
                <>
                  <span className="text-zinc-300">·</span>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-zinc-500 transition-colors hover:text-zinc-900"
                  >
                    Website <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              )}
            </div>
            {company.description && (
              <p className="mt-4 max-w-2xl text-sm text-zinc-600">
                {company.description}
              </p>
            )}
          </div>
          <Button
            onClick={handleWriteReview}
            className="h-12 shrink-0 rounded-full bg-zinc-900 text-white hover:bg-zinc-800"
          >
            Write a Review
          </Button>
        </div>

        {/* Score Block */}
        <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-center">
          <div className="text-center sm:text-left">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-5xl font-black tracking-tight ${
                  company.avgRating >= 4
                    ? 'text-emerald-600'
                    : company.avgRating >= 3
                    ? 'text-zinc-900'
                    : company.avgRating > 0
                    ? 'text-red-500'
                    : 'text-zinc-300'
                }`}
              >
                {company.avgRating > 0 ? company.avgRating.toFixed(1) : '—'}
              </span>
              <span className="text-lg text-zinc-400">/ 5</span>
            </div>
            <StarRating
              rating={company.avgRating}
              size="md"
              className="mt-2 justify-center sm:justify-start"
            />
            <p className="mt-2 text-sm text-zinc-500">
              {company.totalReviews}{' '}
              {company.totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Star breakdown */}
          <div className="flex-1">
            {company.ratingBreakdown.map(({ star, count }) => {
              const pct =
                company.totalReviews > 0
                  ? (count / company.totalReviews) * 100
                  : 0
              return (
                <div key={star} className="flex items-center gap-3 py-1">
                  <span className="w-3 text-xs text-zinc-500">{star}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-zinc-500">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Claim banner */}
        {!approvedClaim && (
          <div className="mt-8 flex items-center justify-between rounded-xl border border-zinc-100 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-zinc-400" />
              <span className="text-sm text-zinc-600">
                Are you the owner? Claim this company to respond to reviews.
              </span>
            </div>
            <button
              onClick={() =>
                user
                  ? setClaimOpen(!claimOpen)
                  : router.push(
                      `/login?redirect=${encodeURIComponent(`/company/${slug}`)}`
                    )
              }
              className="text-sm font-medium text-zinc-900 underline hover:text-zinc-700"
            >
              Claim it →
            </button>
          </div>
        )}

        {claimOpen && (
          <form
            onSubmit={handleClaim}
            className="mt-4 rounded-xl border border-zinc-100 p-6"
          >
            <h3 className="text-base font-semibold">Claim {company.name}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-zinc-900">
                  Full Name
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  defaultValue={user?.fullName}
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm transition-colors focus:border-zinc-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-900">
                  Business Email
                </label>
                <input
                  name="businessEmail"
                  type="email"
                  required
                  defaultValue={user?.email}
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm transition-colors focus:border-zinc-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-900">
                  Registration Number (optional)
                </label>
                <input
                  name="regNumber"
                  type="text"
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-200 px-4 text-sm transition-colors focus:border-zinc-900 focus:outline-none"
                  placeholder="e.g. RDB-123456"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                type="submit"
                disabled={claimSubmitting}
                className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800"
              >
                Submit Claim
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setClaimOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Reviews */}
        <div className="mt-12">
          <h2 className="text-xl font-black tracking-tight">
            Reviews {company.totalReviews > 0 && `(${company.totalReviews})`}
          </h2>

          {company.reviews.length === 0 ? (
            <div className="mt-8 rounded-xl border border-zinc-100 p-12 text-center">
              <p className="text-sm text-zinc-500">
                No reviews yet. Be the first to review.
              </p>
              <Button
                onClick={handleWriteReview}
                className="mt-4 rounded-full bg-zinc-900 text-white hover:bg-zinc-800"
              >
                Write a Review
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {company.reviews.map((review) => {
                const isFlagged = flaggedReviews.has(review.id)
                return (
                  <div
                    key={review.id}
                    className="rounded-xl border border-zinc-100 p-6 transition-colors hover:border-zinc-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-sm font-semibold text-zinc-700">
                            {(review.user?.fullName || 'A')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">
                              {review.user?.fullName || 'Anonymous'}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {formatDistanceToNow(new Date(review.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StarRating rating={review.rating} size="sm" />
                        {user && (
                          <button
                            onClick={() => handleFlag(review.id)}
                            disabled={isFlagged}
                            className="transition-colors disabled:cursor-default"
                            title={isFlagged ? 'Flagged' : 'Flag this review'}
                          >
                            <Flag
                              className={`h-4 w-4 ${
                                isFlagged
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-zinc-300 hover:text-zinc-900'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                        {review.category}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-zinc-700">
                      {review.comment}
                    </p>

                    {review.response && (
                      <div className="mt-4 rounded-xl bg-zinc-50 p-4">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-zinc-400" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Official Response
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-700">
                          {review.response}
                        </p>
                      </div>
                    )}

                    {canRespond && !review.response && (
                      <div className="mt-4">
                        {respondingTo === review.id ? (
                          <div>
                            <textarea
                              value={responseText[review.id] || ''}
                              onChange={(e) =>
                                setResponseText({
                                  ...responseText,
                                  [review.id]: e.target.value,
                                })
                              }
                              placeholder="Write an official response..."
                              rows={3}
                              className="w-full rounded-xl border border-zinc-200 p-3 text-sm transition-colors focus:border-zinc-900 focus:outline-none"
                            />
                            <div className="mt-2 flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleResponse(review.id)}
                                className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800"
                              >
                                Post Response
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => setRespondingTo(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRespondingTo(review.id)}
                            className="text-sm font-medium text-zinc-900 underline hover:text-zinc-700"
                          >
                            Add official response
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <ReviewModal
        companyId={company.id}
        companySlug={company.slug}
        companyName={company.name}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={loadData}
      />
    </div>
  )
}
