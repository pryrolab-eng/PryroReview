'use client'

import Link from 'next/link'
import { ShieldCheck, Star } from 'lucide-react'
import { useState } from 'react'

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

export function CompanyCard({ company }: CompanyCardProps) {
  const filled = Math.round(company.avgRating)
  const [hovered, setHovered] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const logoUrl = getLogoUrl(company.website)

  return (
    <Link
      href={`/company/${company.slug}`}
      className="group relative flex flex-col rounded-xl bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        {/* Logo — hidden by default, shown on hover */}
        <div
          className={`shrink-0 transition-all duration-200 ${
            hovered ? 'w-9 opacity-100' : 'w-0 opacity-0 overflow-hidden'
          }`}
        >
          {logoUrl && !imgFailed ? (
            <img
              src={logoUrl}
              alt={company.name}
              onError={() => setImgFailed(true)}
              className="h-9 w-9 rounded-lg border border-zinc-100 object-contain p-1"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-bold text-zinc-500">
              {company.name[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold text-zinc-900">{company.name}</h3>
            {company.verified && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-zinc-900" />}
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            {company.category}
            {company.verified && <span className="ml-1.5 text-zinc-300">· Verified</span>}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-3 border-t border-zinc-100" />

      {/* Stars + count */}
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-3 w-3 ${s <= filled ? 'fill-amber-400 text-amber-400' : 'fill-zinc-100 text-zinc-100'}`}
            />
          ))}
          {company.avgRating > 0 && (
            <span className="ml-1 text-xs font-semibold text-zinc-700">
              {company.avgRating.toFixed(1)}
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-400">
          {company.reviewCount === 0
            ? 'No reviews yet'
            : `${company.reviewCount} ${company.reviewCount === 1 ? 'review' : 'reviews'}`}
        </span>
      </div>
    </Link>
  )
}
