'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useAuthModal } from '@/lib/auth-modal-context'
import { formatDistanceToNow } from 'date-fns'
import {
  Building2, Pencil, Trash2, Star, X, Loader2, Check, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const REVIEW_CATEGORIES = [
  'Staff Attitude',
  'Speed of Service',
  'Problem Resolution',
  'Facility Condition',
  'Overall Experience',
]

interface ReviewWithCompany {
  id: string
  rating: number
  category: string
  comment: string
  createdAt: string
  company: { id: string; name: string; slug: string; website?: string | null }
}

// ── Company Avatar ──────────────────────────────────────────────────────────
function ReviewCompanyAvatar({ name, website }: { name: string; website?: string | null }) {
  const [failed, setFailed] = useState(false)
  const domain = website
    ? (() => { try { return new URL(website).hostname.replace(/^www\./, '') } catch { return null } })()
    : null

  if (!domain || failed) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-zinc-600">
        {name[0].toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt={name}
      onError={() => setFailed(true)}
      className="h-8 w-8 rounded-lg object-contain shrink-0"
    />
  )
}

// ── Star Display ─────────────────────────────────────────────────────────────
function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            'h-3.5 w-3.5',
            s <= rating ? 'fill-blue-500 text-blue-500' : 'fill-zinc-200 text-zinc-200'
          )}
        />
      ))}
    </div>
  )
}

// ── Edit Modal ──────────────────────────────────────────────────────────────
function EditReviewModal({
  review,
  onClose,
  onSaved,
}: {
  review: ReviewWithCompany
  onClose: () => void
  onSaved: (updated: ReviewWithCompany) => void
}) {
  const [rating, setRating] = useState(review.rating)
  const [hoverRating, setHoverRating] = useState(0)
  const [category, setCategory] = useState(review.category)
  const [comment, setComment] = useState(review.comment)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (comment.trim().length < 50) {
      toast.error('Comment must be at least 50 characters')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, category, comment: comment.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to save changes')
        return
      }
      toast.success('Review updated')
      onSaved(data)
      onClose()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-md border border-zinc-200 bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold text-zinc-900">Edit Review</h2>
        <p className="mt-0.5 text-sm text-zinc-500">{review.company.name}</p>

        {/* Rating */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-zinc-900 mb-2">Rating</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                className="flex h-10 w-10 items-center justify-center focus:outline-none"
              >
                <Star
                  className={cn(
                    'h-7 w-7 transition-colors',
                    s <= (hoverRating || rating)
                      ? 'fill-blue-500 text-blue-500'
                      : 'fill-blue-100 text-blue-100'
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-zinc-900 mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3.5 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950"
          >
            {REVIEW_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Comment */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-zinc-900 mb-1.5">Your Experience</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-zinc-300 bg-white p-3.5 text-sm text-zinc-900 placeholder:text-gray-400 focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950 resize-none"
          />
          <div className="mt-1 flex justify-end">
            <span className={cn('text-xs', comment.trim().length >= 50 ? 'text-zinc-900 font-semibold' : 'text-zinc-400')}>
              {comment.trim().length} / 50 min
            </span>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1 border-zinc-900 text-zinc-900 hover:bg-zinc-100" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={saving || comment.trim().length < 50}
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <><Check className="h-4 w-4" /> Save Changes</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function MyReviewsPage() {
  const { user, loading: authLoading } = useAuth()
  const { openAuthModal } = useAuthModal()
  const [reviews, setReviews] = useState<ReviewWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [editingReview, setEditingReview] = useState<ReviewWithCompany | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [sortOrder, setSortOrder] = useState<string>('newest')

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }

    setLoading(true)
    setFetchError(null)

    fetch('/api/reviews')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setReviews(Array.isArray(data) ? data : [])
        } else {
          const err = await res.json().catch(() => ({}))
          setFetchError(err.error || `Error ${res.status}`)
        }
      })
      .catch(() => setFetchError('Could not load reviews. Please retry.'))
      .finally(() => setLoading(false))
  }, [user?.id, authLoading])

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete review')
        return
      }
      setReviews((prev) => prev.filter((r) => r.id !== id))
      setDeleteConfirm(null)
      toast.success('Review deleted')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleSaved = (updated: ReviewWithCompany) => {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
  }

  // ── Stats ──
  const totalReviews = reviews.length
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0
  const uniqueCompanies = new Set(reviews.map((r) => r.company.id)).size
  const now = new Date()
  const thisMonthCount = reviews.filter((r) => {
    const d = new Date(r.createdAt)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length

  // ── Filter + Sort ──
  const filtered = filterRating !== null
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortOrder === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    if (sortOrder === 'highest') return b.rating - a.rating
    if (sortOrder === 'lowest') return a.rating - b.rating
    return 0
  })

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-screen-2xl px-6 py-10">
        <div className="flex gap-6 items-start">
          <div className="hidden lg:block w-64 shrink-0">
            <div className="h-7 w-32 animate-pulse rounded bg-zinc-100 mb-4" />
            {[1,2,3,4].map((i) => <div key={i} className="mb-3 h-20 animate-pulse rounded-2xl bg-zinc-100" />)}
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
            {[1,2,3].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-zinc-100" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="w-full px-6 py-20 flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <Building2 className="h-5 w-5 text-zinc-400" />
        </div>
        <p className="mt-4 text-sm font-semibold text-zinc-900">Sign in to see your reviews</p>
        <p className="mt-1 text-xs text-zinc-500">Your submitted reviews will appear here.</p>
        <Button
          className="mt-5 bg-blue-700 hover:bg-blue-800 text-white"
          onClick={() => openAuthModal('view your reviews')}
        >
          Sign In
        </Button>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="mx-auto max-w-screen-2xl px-6 py-10">
        <h1 className="text-2xl font-bold text-zinc-900">My Reviews</h1>
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {fetchError}
          <button onClick={() => window.location.reload()} className="ml-3 font-semibold underline hover:no-underline">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="mx-auto max-w-screen-2xl px-6 py-10">
        <div className="flex gap-6 items-start">

          {/* ── Left Sidebar ── */}
          <div className="hidden lg:block w-64 shrink-0 sticky top-20 self-start">
            <h1 className="text-2xl font-bold text-zinc-900">My Reviews</h1>
            <p className="mt-1 text-sm text-zinc-500">{user.fullName}</p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl p-4 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                <div>
                  <p className="text-2xl font-bold text-zinc-900">{totalReviews}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Total Reviews</p>
                </div>
              </div>

              {/* Avg Rating */}
              <div className="rounded-2xl p-4 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                <div>
                  <p className="text-2xl font-bold text-zinc-900">
                    {totalReviews === 0 ? '—' : avgRating.toFixed(1)}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">Avg Rating Given</p>
                </div>
              </div>

              {/* Companies Reviewed */}
              <div className="rounded-2xl p-4 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                <div>
                  <p className="text-2xl font-bold text-zinc-900">{uniqueCompanies}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Companies Reviewed</p>
                </div>
              </div>

              {/* This Month */}
              <div className="rounded-2xl p-4 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                <div>
                  <p className="text-2xl font-bold text-zinc-900">{thisMonthCount}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">This Month</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Main ── */}
          <div className="flex-1 min-w-0">

            {/* Mobile header */}
            <div className="lg:hidden mb-5">
              <h1 className="text-2xl font-bold text-zinc-900">My Reviews</h1>
              <p className="text-sm text-zinc-500">{user.fullName}</p>
            </div>

            {/* Filter + Sort row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              {/* Rating pill filters */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFilterRating(null)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                    filterRating === null
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 text-zinc-600 hover:border-gray-300'
                  )}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFilterRating(filterRating === star ? null : star)}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                      filterRating === star
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 text-zinc-600 hover:border-gray-300'
                    )}
                  >
                    {star}★
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600 hover:border-gray-300 transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>

            {/* Empty state */}
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white py-20 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white">
                  <Building2 className="h-5 w-5 text-zinc-400" />
                </div>
                <p className="mt-4 text-sm font-medium text-zinc-900">You haven't written any reviews yet</p>
                <p className="mt-1 text-xs text-zinc-500">Find a company and share your experience.</p>
                <Button asChild className="mt-5">
                  <Link href="/">Write Your First Review <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            ) : sorted.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white py-16 text-center">
                <p className="text-sm font-medium text-zinc-900">No reviews match this filter</p>
                <button onClick={() => setFilterRating(null)} className="mt-3 text-xs text-blue-600 hover:underline">
                  Clear filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sorted.map((review) => (
                  <div
                    key={review.id}
                    className="flex flex-col rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.13)] transition-shadow"
                  >
                    {/* Header: avatar + company + date */}
                    <div className="flex items-start gap-3">
                      <ReviewCompanyAvatar
                        name={review.company.name}
                        website={(review.company as any).website}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{review.company.name}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Star rating */}
                    <div className="mt-3">
                      <StarDisplay rating={review.rating} />
                    </div>

                    {/* Category badge */}
                    <span className="mt-2 inline-block self-start rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600">
                      {review.category}
                    </span>

                    {/* Comment */}
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-700 flex-1">
                      {review.comment}
                    </p>

                    {/* Bottom row */}
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-100">
                      <Link
                        href={`/company/${review.company.slug}`}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        View Company
                      </Link>

                      <div className="flex items-center gap-1">
                        {/* Edit */}
                        <button
                          onClick={() => setEditingReview(review)}
                          className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                          title="Edit review"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete */}
                        {deleteConfirm === review.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(review.id)}
                              disabled={deleting === review.id}
                              className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              {deleting === review.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                'Delete'
                              )}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs text-zinc-600 hover:border-zinc-500"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(review.id)}
                            className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Delete review"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
