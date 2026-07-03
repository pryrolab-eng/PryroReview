'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useAuthModal } from '@/lib/auth-modal-context'
import { ReviewModal } from '@/components/shared/review-modal'

interface CompanyCardProps {
  company: {
    id: string
    name: string
    slug: string
    category: string
    district?: string
    website?: string | null
    verified?: boolean
    avgRating: number
    reviewCount: number
  }
}

function getLogoUrl(website?: string | null): string | null {
  if (!website) return null
  try {
    const domain = new URL(website).hostname.replace(/^www\./, '')
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch { return null }
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
    'bg-orange-100 text-orange-700',
    'bg-teal-100 text-teal-700',
  ]
  return colors[name.charCodeAt(0) % colors.length]
}

export function CompanyCard({ company }: CompanyCardProps) {
  const filled = Math.round(company.avgRating)
  const [imgFailed, setImgFailed] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const logoUrl = getLogoUrl(company.website)
  const avatarColor = getAvatarColor(company.name)
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal()

  const handleReviewClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (user) {
      setShowReviewModal(true)
    } else {
      openAuthModal('write a review', 'login')
    }
  }

  return (
    <div className="relative">
      <Link
        href={`/company/${company.slug}`}
        className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-3 transition-shadow duration-200 hover:shadow-md"
      >
        {/* Top row */}
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            {logoUrl && !imgFailed ? (
              <img
                src={logoUrl}
                alt={company.name}
                onError={() => setImgFailed(true)}
                className="h-9 w-9 rounded-lg border border-gray-100 object-contain p-1 bg-white"
              />
            ) : (
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${avatarColor}`}>
                {company.name[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-zinc-900">{company.name}</h3>
            <p className="mt-0.5 text-xs text-zinc-500">
              {company.category}
              {company.district && <span className="ml-1">· {company.district}</span>}
            </p>
          </div>
        </div>

        {/* Stars + Review button */}
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3 w-3 ${s <= filled ? 'fill-blue-500 text-blue-500' : 'fill-blue-100 text-blue-100'}`}
              />
            ))}
            {company.avgRating > 0 && (
              <span className="ml-1 text-xs font-semibold text-zinc-700">
                {company.avgRating.toFixed(1)}
              </span>
            )}
          </div>
          <button
            onClick={handleReviewClick}
            className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Review
          </button>
        </div>
      </Link>

      {/* Review modal (logged in) */}
      <ReviewModal
        companyId={company.id}
        companySlug={company.slug}
        companyName={company.name}
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmitted={() => setShowReviewModal(false)}
      />
    </div>
  )
}
