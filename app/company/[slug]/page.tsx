'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Flag, ArrowLeft, ExternalLink, MessageSquare, Building2, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { StarRating } from '@/components/shared/star-rating'
import { ReviewModal } from '@/components/shared/review-modal'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface Review {
  id: string; rating: number; category: string; comment: string
  response: string | null; createdAt: string
  user: { id: string; fullName: string }
}
interface CompanyData {
  id: string; name: string; slug: string; category: string; district: string
  website: string | null; description: string | null; verified: boolean
  reviews: Review[]; avgRating: number; totalReviews: number
  ratingBreakdown: { star: number; count: number }[]
  categoryScores: { category: string; avgRating: number; count: number }[]
}


export default function CompanyProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user } = useAuth()

  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [flaggedReviews, setFlaggedReviews] = useState<Set<string>>(new Set())
  const [responseText, setResponseText] = useState<Record<string, string>>({})
  const [respondingTo, setRespondingTo] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/companies/${slug}`)
      if (!res.ok) { setLoading(false); return }
      const data = await res.json()
      setCompany(data)
      const stored = localStorage.getItem(`flagged-${data.id}`)
      if (stored) setFlaggedReviews(new Set(JSON.parse(stored)))
    } finally { setLoading(false) }
  }, [slug])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('review') === 'true' && user) {
      setModalOpen(true)
      window.history.replaceState({}, '', `/company/${slug}`)
    }
  }, [user, slug])

  const handleWriteReview = () => {
    if (!user) { router.push(`/login?redirect=${encodeURIComponent(`/company/${slug}?review=true`)}`); return }
    setModalOpen(true)
  }

  const handleFlag = async (reviewId: string) => {
    if (!user) { router.push(`/login?redirect=${encodeURIComponent(`/company/${slug}`)}`); return }
    try {
      const res = await fetch('/api/flags', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, reason: 'Inappropriate content' }),
      })
      if (!res.ok) { toast.error((await res.json()).error || 'Failed to flag'); return }
      const next = new Set(flaggedReviews); next.add(reviewId); setFlaggedReviews(next)
      if (company) localStorage.setItem(`flagged-${company.id}`, JSON.stringify(Array.from(next)))
      toast.success('Review flagged for moderation')
    } catch { toast.error('Failed to flag review') }
  }

  const handleResponse = async (reviewId: string) => {
    if (!user || !company) return
    const text = responseText[reviewId]; if (!text) return
    try {
      const res = await fetch(`/api/reviews/${reviewId}/respond`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: text }),
      })
      if (!res.ok) { toast.error((await res.json()).error || 'Failed'); return }
      toast.success('Response added'); setRespondingTo(null)
      setResponseText({ ...responseText, [reviewId]: '' }); loadData()
    } catch { toast.error('Failed to add response') }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-6 w-24 animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-8 h-10 w-64 animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-3 h-4 w-40 animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-10 h-28 animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-4 space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <Building2 className="mx-auto h-10 w-10 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Company not found</h1>
        <p className="mt-2 text-sm text-slate-500">This company doesn&apos;t exist or has been removed.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-600">
          Back to Home
        </Link>
      </div>
    )
  }

  const canRespond = user && user.role === 'ADMIN'

  return (
    <div className="animate-fade-up">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {/* Header */}
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{company.name}</h1>
              {company.verified && (
                <span className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>{company.category}</span>
              <span className="text-slate-300">·</span>
              <span>{company.district}</span>
              {company.website && (
                <>
                  <span className="text-slate-300">·</span>
                  <a href={company.website} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700">
                    Website <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              )}
            </div>
            {company.description && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{company.description}</p>
            )}
          </div>
          <button onClick={handleWriteReview}
            className="shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
            Write a Review
          </button>
        </div>

        {/* Score block */}
        <div className="mt-10 flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
          <div className="text-center sm:text-left sm:w-32 sm:shrink-0">
            <span className="text-5xl font-extrabold tabular-nums text-slate-900">
              {company.avgRating > 0 ? company.avgRating.toFixed(1) : '—'}
            </span>
            <span className="ml-1 text-lg text-slate-400">/ 5</span>
            <StarRating rating={company.avgRating} size="md" className="mt-2 justify-center sm:justify-start" />
            <p className="mt-1.5 text-xs text-slate-400">
              {company.totalReviews} {company.totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          <div className="flex-1 space-y-2">
            {company.ratingBreakdown.map(({ star, count }) => {
              const pct = company.totalReviews > 0 ? (count / company.totalReviews) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-3 text-xs text-slate-500">{star}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-xs text-slate-400">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">
            Reviews {company.totalReviews > 0 && <span className="text-slate-400 font-normal text-base ml-1">({company.totalReviews})</span>}
          </h2>

          {company.reviews.length === 0 ? (
            <div className="mt-4 flex flex-col items-center rounded-xl border border-slate-200 bg-white py-16 text-center">
              <p className="text-sm text-slate-500">No reviews yet. Be the first to review.</p>
              <button onClick={handleWriteReview}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                Write a Review
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {company.reviews.map((review) => {
                const isFlagged = flaggedReviews.has(review.id)
                return (
                  <div key={review.id} className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                          {(review.user?.fullName || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{review.user?.fullName || 'Anonymous'}</p>
                          <p className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StarRating rating={review.rating} size="sm" />
                        {user && (
                          <button onClick={() => handleFlag(review.id)} disabled={isFlagged}
                            title={isFlagged ? 'Flagged' : 'Flag'}>
                            <Flag className={`h-4 w-4 ${isFlagged ? 'fill-red-400 text-red-400' : 'text-slate-300 hover:text-slate-600'}`} />
                          </button>
                        )}
                      </div>
                    </div>

                    <span className="mt-3 inline-block rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {review.category}
                    </span>

                    <p className="mt-3 text-sm leading-relaxed text-slate-700">{review.comment}</p>

                    {review.response && (
                      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Official Response</span>
                        </div>
                        <p className="text-sm text-slate-700">{review.response}</p>
                      </div>
                    )}

                    {canRespond && !review.response && (
                      <div className="mt-4">
                        {respondingTo === review.id ? (
                          <div>
                            <textarea
                              value={responseText[review.id] || ''}
                              onChange={(e) => setResponseText({ ...responseText, [review.id]: e.target.value })}
                              placeholder="Write an official response..." rows={3}
                              className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                            <div className="mt-2 flex gap-2">
                              <button onClick={() => handleResponse(review.id)}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                                Post Response
                              </button>
                              <button onClick={() => setRespondingTo(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setRespondingTo(review.id)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            Add official response →
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
        companyId={company.id} companySlug={company.slug} companyName={company.name}
        open={modalOpen} onClose={() => setModalOpen(false)} onSubmitted={loadData}
      />
    </div>
  )
}
