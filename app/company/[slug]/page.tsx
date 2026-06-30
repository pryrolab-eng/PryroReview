'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Flag, ArrowLeft, ExternalLink, MessageSquare, Building2, ShieldCheck, Star } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { StarRating } from '@/components/shared/star-rating'
import { ReviewModal } from '@/components/shared/review-modal'
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

function ReviewerAvatar({ name }: { name: string }) {
  const colors = [
    'bg-orange-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-blue-500', 'bg-rose-500', 'bg-amber-500', 'bg-teal-500',
  ]
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color} text-sm font-bold text-white`}>
      {name[0].toUpperCase()}
    </div>
  )
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
        />
      ))}
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
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10">
        <div className="h-6 w-24 animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-slate-100" />
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
  const TRUNCATE_LEN = 160

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">

      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* ── Main card ── */}
      <div className="mt-6 overflow-hidden rounded-2xl bg-white">
        <div className="flex flex-col lg:flex-row">

          {/* ── Left panel ── */}
          <div className="flex flex-col justify-between p-8 lg:w-72 lg:shrink-0 lg:p-10">
            <div>
              <h1 className="text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">
                What People Are Saying About {company.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="default">
                  {company.category}
                </Badge>
                <Badge variant="secondary">
                  {company.district}
                </Badge>
                {company.verified && (
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-transparent gap-1">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>

              {/* Overall score */}
              <div className="mt-6">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold text-slate-900">
                    {company.avgRating > 0 ? company.avgRating.toFixed(1) : '0.0'}
                  </span>
                  <span className="mb-1 text-slate-400 text-base">/ 5</span>
                </div>
                <StarRow rating={Math.round(company.avgRating)} />
                <p className="mt-1.5 text-sm text-slate-500">
                  {company.totalReviews} {company.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              {company.description && (
                <p className="mt-5 text-sm leading-relaxed text-slate-600">{company.description}</p>
              )}

              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Visit website <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            <button
              onClick={handleWriteReview}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
            >
              Write a Review
            </button>
          </div>

          {/* ── Right: review grid ── */}
          <div className="flex-1 bg-white p-6 lg:p-8">
            {company.reviews.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-slate-500">No reviews yet. Be the first to review.</p>
                <button onClick={handleWriteReview}
                  className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
                  Write a Review
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {company.reviews.map((review) => {
                  const isFlagged = flaggedReviews.has(review.id)
                  const isLong = review.comment.length > TRUNCATE_LEN
                  const isExpanded = expanded.has(review.id)

                  return (
                    <div key={review.id} className="flex flex-col rounded-xl bg-white p-4 shadow-sm">
                      {/* Reviewer row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <ReviewerAvatar name={review.user?.fullName || 'A'} />
                          <div>
                            <p className="text-sm font-semibold text-slate-900 leading-tight">
                              {review.user?.fullName || 'Anonymous'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        {user && (
                          <button onClick={() => handleFlag(review.id)} disabled={isFlagged} title={isFlagged ? 'Flagged' : 'Flag'}>
                            <Flag className={`h-3.5 w-3.5 ${isFlagged ? 'fill-red-400 text-red-400' : 'text-slate-300 hover:text-slate-500'}`} />
                          </button>
                        )}
                      </div>

                      {/* Stars */}
                      <div className="mt-2.5">
                        <StarRow rating={review.rating} />
                      </div>

                      {/* Comment */}
                      <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
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
                          className="mt-1 self-start text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}

                      {/* Official response */}
                      {review.response && (
                        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">Official Response</span>
                          </div>
                          <p className="text-xs text-slate-700">{review.response}</p>
                        </div>
                      )}

                      {/* Admin respond */}
                      {canRespond && !review.response && (
                        <div className="mt-3">
                          {respondingTo === review.id ? (
                            <div>
                              <textarea
                                value={responseText[review.id] || ''}
                                onChange={(e) => setResponseText({ ...responseText, [review.id]: e.target.value })}
                                placeholder="Write an official response..." rows={2}
                                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none resize-none" />
                              <div className="mt-1.5 flex gap-2">
                                <button onClick={() => handleResponse(review.id)}
                                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                                  Post
                                </button>
                                <button onClick={() => setRespondingTo(null)}
                                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setRespondingTo(review.id)}
                              className="text-xs font-medium text-blue-600 hover:text-blue-700">
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
        </div>
      </div>

      <ReviewModal
        companyId={company.id} companySlug={company.slug} companyName={company.name}
        open={modalOpen} onClose={() => setModalOpen(false)} onSubmitted={loadData}
      />
    </div>
  )
}
