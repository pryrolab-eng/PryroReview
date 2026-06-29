'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StarRating } from '@/components/shared/star-rating'
import { useAuth } from '@/lib/auth-context'
import { formatDistanceToNow } from 'date-fns'
import { Building2, ArrowRight } from 'lucide-react'

interface ReviewWithCompany {
  id: string; rating: number; category: string; comment: string; createdAt: string
  company: { id: string; name: string; slug: string }
}

export default function MyReviewsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<ReviewWithCompany[]>([])
  const [loading, setLoading] = useState(true)

  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews')
      if (res.ok) setReviews(await res.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login?redirect=/my-reviews'); return }
    if (user) loadReviews()
  }, [user, authLoading, router, loadReviews])

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-7 w-32 animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-6 space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      </div>
    )
  }

  const avg = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="animate-fade-up mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Reviews</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
            <span>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
            {avg && (
              <>
                <span className="text-slate-200">·</span>
                <span>{avg} avg rating</span>
              </>
            )}
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-600"
        >
          Browse <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Empty */}
      {reviews.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-xl border border-slate-200 bg-white py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
            <Building2 className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-700">No reviews yet</p>
          <p className="mt-1 text-xs text-slate-400">Find a company and share your experience.</p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Browse Companies <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/company/${review.company.slug}`}
              className="group block rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-[0_4px_24px_0_rgba(37,99,235,0.08)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                    {review.company.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <StarRating rating={review.rating} size="sm" className="shrink-0" />
              </div>
              <span className="mt-3 inline-block rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                {review.category}
              </span>
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                {review.comment}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
