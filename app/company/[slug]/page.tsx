'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Flag, ArrowLeft, ExternalLink, MessageSquare, Building2, ShieldCheck, Star } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { ReviewModal } from '@/components/shared/review-modal'
import { AuthGateModal } from '@/components/shared/auth-gate-modal'
import { Badge } from '@/components/ui/badge'
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

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-100'}`} />
      ))}
    </div>
  )
}

function ReviewerAvatar({ name }: { name: string }) {
  const colors = ['bg-orange-500', 'bg-violet-500', 'bg-slate-600', 'bg-blue-500', 'bg-rose-500', 'bg-amber-500', 'bg-indigo-500']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${color} text-xs font-bold text-white`}>
      {name[0].toUpperCase()}
    </div>
  )
}

export default function CompanyProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user } = useAuth()

  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [flaggedReviews, setFlaggedReviews] = useState<Set<string>>(new Set())
  const [responseText, setResponseText] = useState<Record<string, string>>({})
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

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
    if (!user) { setAuthOpen(true); return }
    setModalOpen(true)
  }

  const handleFlag = async (reviewId: string) => {
    if (!user) { setAuthOpen(true); return }
    try {
      const res = await fetch('/api/flags', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, reason: 'Inappropriate content' }),
      })
      if (!res.ok) { toast.error((await res.json()).error || 'Failed to flag'); return }
      const next = new Set(flaggedReviews); next.add(reviewId); setFlaggedReviews(next)
      if (company) localStorage.setItem(`flagged-${company.id}`, JSON.stringify(Array.from(next)))
      toast.success('Review flagged')
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
      toast.success('Response added')
      setRespondingTo(null)
      setResponseText({ ...responseText, [reviewId]: '' })
      loadData()
    } catch { toast.error('Failed to add response') }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-5 w-16 animate-pulse rounded bg-slate-100" />
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
        <Building2 className="mx-auto h-10 w-10 text-slate-200" />
        <p className="mt-4 text-sm text-slate-500">Company not found.</p>
        <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    )
  }

  const canRespond = user?.role === 'ADMIN'
  const TRUNCATE_LEN = 200

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* ── Company header ── */}
      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
            {company.verified && <ShieldCheck className="h-5 w-5 text-slate-900" />}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="default" className="text-[11px]">{company.category}</Badge>
            <Badge variant="secondary" className="text-[11px]">{company.district}</Badge>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-900 transition-colors">
                <ExternalLink className="h-3 w-3" />
                {new URL(company.website).hostname.replace(/^www\./, '')}
              </a>
            )}
          </div>

          {company.description && (
            <p className="mt-3 max-w-xl text-sm text-slate-500 leading-relaxed">{company.description}</p>
          )}
        </div>

        {/* Rating summary */}
        <div className="flex items-center gap-4 sm:shrink-0 sm:flex-col sm:items-end sm:gap-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold tabular-nums text-slate-900">
              {company.avgRating > 0 ? company.avgRating.toFixed(1) : '—'}
            </span>
            <span className="text-sm text-slate-400">/ 5</span>
          </div>
          <StarRow rating={Math.round(company.avgRating)} />
          <span className="text-xs text-slate-400">
            {company.totalReviews} {company.totalReviews === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      </div>

      {/* ── Write review button ── */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleWriteReview}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
        >
          Write a Review
        </button>
      </div>

      {/* ── Divider ── */}
      <div className="mt-8 border-t border-slate-100" />

      {/* ── Reviews ── */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Reviews {company.totalReviews > 0 && `(${company.totalReviews})`}
        </h2>

        {company.reviews.length === 0 ? (
          <div className="mt-6 py-16 text-center">
            <p className="text-sm text-slate-400">No reviews yet. Be the first.</p>
            <button onClick={handleWriteReview}
              className="mt-4 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Write a Review
            </button>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {company.reviews.map((review) => {
              const isFlagged = flaggedReviews.has(review.id)
              const isLong = review.comment.length > TRUNCATE_LEN
              const isExpanded = expanded.has(review.id)

              return (
                <div key={review.id} className="py-6">
                  {/* Reviewer row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ReviewerAvatar name={review.user?.fullName || 'A'} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {review.user?.fullName || 'Anonymous'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StarRow rating={review.rating} />
                      {user && (
                        <button
                          onClick={() => handleFlag(review.id)}
                          disabled={isFlagged}
                          title={isFlagged ? 'Flagged' : 'Flag review'}
                          className="text-slate-300 hover:text-slate-500 transition-colors disabled:cursor-not-allowed"
                        >
                          <Flag className={`h-3.5 w-3.5 ${isFlagged ? 'fill-red-400 text-red-400' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category tag */}
                  <div className="mt-3">
                    <Badge variant="outline" className="text-[10px] text-slate-500">{review.category}</Badge>
                  </div>

                  {/* Comment */}
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {isLong && !isExpanded
                      ? review.comment.slice(0, TRUNCATE_LEN) + '…'
                      : review.comment}
                  </p>
                  {isLong && (
                    <button
                      onClick={() => setExpanded((prev) => {
                        const next = new Set(prev)
                        isExpanded ? next.delete(review.id) : next.add(review.id)
                        return next
                      })}
                      className="mt-1 text-xs font-medium text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}

                  {/* Official response */}
                  {review.response && (
                    <div className="mt-4 flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Official Response</p>
                        <p className="text-sm text-slate-600">{review.response}</p>
                      </div>
                    </div>
                  )}

                  {/* Admin respond */}
                  {canRespond && !review.response && (
                    <div className="mt-3">
                      {respondingTo === review.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={responseText[review.id] || ''}
                            onChange={(e) => setResponseText({ ...responseText, [review.id]: e.target.value })}
                            placeholder="Write an official response..."
                            rows={3}
                            className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-slate-900 focus:outline-none resize-none"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleResponse(review.id)}
                              className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">
                              Post
                            </button>
                            <button onClick={() => setRespondingTo(null)}
                              className="rounded-full border border-slate-200 px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setRespondingTo(review.id)}
                          className="text-xs text-slate-400 hover:text-slate-900 transition-colors">
                          Add response →
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

      <ReviewModal
        companyId={company.id}
        companySlug={company.slug}
        companyName={company.name}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={loadData}
      />

      <AuthGateModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        action="write a review"
      />
    </div>
  )
}
