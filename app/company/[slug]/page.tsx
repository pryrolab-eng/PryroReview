'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useAuthModal } from '@/lib/auth-modal-context'
import { ReviewModal } from '@/components/shared/review-modal'
import { formatDistanceToNow } from 'date-fns'

interface Review {
  id: string
  rating: number
  category: string
  comment: string
  createdAt: string
  user: { id: string; fullName: string }
}

interface CompanyData {
  id: string
  name: string
  slug: string
  category: string
  district: string
  website: string | null
  avgRating: number
  totalReviews: number
  reviews: Review[]
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? 'fill-blue-500 text-blue-500' : 'fill-blue-100 text-blue-100'}`} />
      ))}
    </div>
  )
}

function ReviewerAvatar({ name }: { name: string }) {
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-orange-500']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color} text-sm font-bold text-white`}>
      {name[0].toUpperCase()}
    </div>
  )
}

export default function CompanyPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal()

  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/companies/${slug}`)
      if (res.ok) setCompany(await res.json())
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { loadData() }, [loadData])

  const handleWriteReview = () => {
    if (!user) {
      openAuthModal('write a review', 'login')
    } else {
      setModalOpen(true)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {[1,2,3].map(i => <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <p className="text-sm text-zinc-500">Company not found.</p>
        <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">

      {/* Reviews */}
      <div className="mt-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-5">
          Reviews {company.totalReviews > 0 && `(${company.totalReviews})`}
        </h2>

        {company.reviews.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-500 mb-4">No reviews yet. Be the first.</p>
            <button
              onClick={handleWriteReview}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Write a Review
            </button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {company.reviews.map((review) => (
              <div key={review.id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ReviewerAvatar name={review.user?.fullName || 'A'} />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{review.user?.fullName || 'Anonymous'}</p>
                      <p className="text-xs text-zinc-400">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <StarRow rating={review.rating} />
                </div>

                {/* Category */}
                <span className="w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-zinc-600">
                  {review.category}
                </span>

                {/* Comment */}
                <p className="text-sm leading-relaxed text-zinc-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
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
