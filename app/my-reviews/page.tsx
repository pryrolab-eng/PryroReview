'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { StarRating } from '@/components/shared/star-rating'
import { useAuth } from '@/lib/auth-context'
import { useAuthModal } from '@/lib/auth-modal-context'
import { formatDistanceToNow } from 'date-fns'
import { Building2, Pencil, Trash2, Star, X, Loader2, Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const categories = [
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
  company: { id: string; name: string; slug: string }
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
      <div className="relative w-full max-w-md rounded-md border border-zinc-200 bg-white p-6 shadow-xl">
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
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-zinc-100 text-zinc-200'
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
            {categories.map((c) => (
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
            className="w-full rounded-md border border-zinc-300 bg-white p-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950 resize-none"
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
  // track whether we've already kicked off a fetch so we don't fire twice
  const fetchedRef = useRef(false)

  const loadReviews = useCallback(async () => {
    if (fetchedRef.current) return   // prevent duplicate calls
    fetchedRef.current = true
    setLoading(true)
    setFetchError(null)
    // 10s hard timeout on the fetch
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch('/api/reviews', { signal: controller.signal })
      if (res.ok) {
        const data = await res.json()
        setReviews(Array.isArray(data) ? data : [])
      } else {
        const err = await res.json().catch(() => ({}))
        setFetchError(err.error || `Error ${res.status}`)
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        setFetchError('Request timed out — the database may be waking up. Please retry.')
      } else {
        setFetchError('Could not load reviews. Please retry.')
      }
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      openAuthModal('view your reviews')
      return
    }
    loadReviews()
  }, [user, authLoading, loadReviews])

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

  if (authLoading || loading) {
    return (
      <div className="w-full px-6 py-12 lg:px-10">
        <div className="h-7 w-32 animate-pulse rounded bg-zinc-100" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-md bg-zinc-100" />
          ))}
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="w-full px-6 py-12 lg:px-10">
        <h1 className="text-2xl font-bold text-zinc-900">My Reviews</h1>
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {fetchError}
          <button
            onClick={() => { fetchedRef.current = false; loadReviews() }}
            className="ml-3 font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null

  return (
    <>
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="animate-fade-up w-full px-6 py-12 lg:px-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">My Reviews</h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500">
              <span>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
              {avg && (
                <>
                  <span>·</span>
                  <span>{avg} avg rating</span>
                </>
              )}
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-md border border-zinc-200 bg-white py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-zinc-200 bg-white">
              <Building2 className="h-5 w-5 text-zinc-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-900">No reviews yet</p>
            <p className="mt-1 text-xs text-zinc-500">Find a company and share your experience.</p>
            <Button asChild className="mt-5">
              <Link href="/">Browse Companies <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-md border border-zinc-200 bg-white p-5"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/company/${review.company.slug}`}
                    className="group min-w-0"
                  >
                    <p className="text-sm font-semibold text-zinc-900 group-hover:underline truncate">
                      {review.company.name}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </p>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    <StarRating rating={review.rating} size="sm" />

                    {/* Edit button */}
                    <button
                      onClick={() => setEditingReview(review)}
                      className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                      title="Edit review"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* Delete button / confirm */}
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
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category badge */}
                <span className="mt-3 inline-block rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600">
                  {review.category}
                </span>

                {/* Comment */}
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-700">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
