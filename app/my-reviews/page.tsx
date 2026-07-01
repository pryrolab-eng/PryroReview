'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { StarRating } from '@/components/shared/star-rating'
import { useAuth } from '@/lib/auth-context'
import { useAuthModal } from '@/lib/auth-modal-context'
import { formatDistanceToNow } from 'date-fns'
import { Building2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ReviewWithCompany {
  id: string; rating: number; category: string; comment: string; createdAt: string
  company: { id: string; name: string; slug: string }
}

export default function MyReviewsPage() {
  const { user, loading: authLoading } = useAuth()
  const { openAuthModal } = useAuthModal()
  const [reviews, setReviews] = useState<ReviewWithCompany[]>([])
  const [loading, setLoading] = useState(true)

  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews')
      if (res.ok) setReviews(await res.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) { openAuthModal('view your reviews'); return }
    if (user) loadReviews()
  }, [user, authLoading, openAuthModal, loadReviews])

  if (authLoading || loading) {
    return (
      <div className="w-full px-6 py-12 lg:px-10">
        <div className="h-7 w-32 animate-pulse rounded bg-zinc-100" />
        <div className="mt-6 space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-28 animate-pulse rounded-md bg-zinc-100" />)}
        </div>
      </div>
    )
  }

  const avg = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="animate-fade-up w-full px-6 py-12 lg:px-10">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Reviews</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-zinc-900">
            <span>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
            {avg && (
              <>
                <span className="text-zinc-900">·</span>
                <span>{avg} avg rating</span>
              </>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Browse <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-md border border-zinc-200 bg-white py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-zinc-200 bg-white">
            <Building2 className="h-5 w-5 text-zinc-900" />
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-900">No reviews yet</p>
          <p className="mt-1 text-xs text-zinc-900">Find a company and share your experience.</p>
          <Button asChild className="mt-5">
            <Link href="/">Browse Companies <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/company/${review.company.slug}`}
              className="block rounded-md border border-zinc-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {review.company.name}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-900">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <StarRating rating={review.rating} size="sm" className="shrink-0" />
              </div>
              <span className="mt-3 inline-block rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-900">
                {review.category}
              </span>
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-900">
                {review.comment}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
