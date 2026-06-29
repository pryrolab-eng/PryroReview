'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StarRating } from '@/components/shared/star-rating'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { formatDistanceToNow } from 'date-fns'

interface ReviewWithCompany {
  id: string
  rating: number
  category: string
  comment: string
  createdAt: string
  company: {
    id: string
    name: string
    slug: string
  }
}

export default function MyReviewsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<ReviewWithCompany[]>([])
  const [loading, setLoading] = useState(true)

  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews')
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/my-reviews')
      return
    }
    if (user) loadReviews()
  }, [user, authLoading, router, loadReviews])

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
        <div className="h-8 w-32 animate-pulse rounded bg-zinc-100" />
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-zinc-100" />
          ))}
        </div>
      </div>
    )
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  return (
    <div className="animate-fade-up mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-black tracking-tight text-zinc-900">
        My Reviews
      </h1>

      <div className="mt-6 flex items-center gap-8 text-sm text-zinc-500">
        <span className="font-medium text-zinc-900">
          {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
        </span>
        {reviews.length > 0 && (
          <>
            <span className="text-zinc-300">·</span>
            <span className="font-medium text-zinc-900">
              {avgRating.toFixed(1)} Avg Rating
            </span>
          </>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="mt-8 rounded-xl border border-zinc-100 p-12 text-center">
          <p className="text-4xl">📝</p>
          <p className="mt-4 text-sm text-zinc-500">
            You haven&apos;t written any reviews yet.
          </p>
          <Link href="/">
            <Button className="mt-4 rounded-full bg-zinc-900 text-white hover:bg-zinc-800">
              Browse Companies
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/company/${review.company.slug}`}
              className="block rounded-xl border border-zinc-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {review.company.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              <div className="mt-3">
                <span className="inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                  {review.category}
                </span>
              </div>
              <p className="mt-4 line-clamp-2 text-sm text-zinc-600">
                {review.comment}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
