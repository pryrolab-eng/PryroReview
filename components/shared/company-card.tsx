'use client'

import Link from 'next/link'
import { ShieldCheck, ArrowUpRight, Star } from 'lucide-react'
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
  } catch {
    return null
  }
}

function CompanyAvatar({ name, website }: { name: string; website?: string | null }) {
  const [failed, setFailed] = useState(false)
  const logoUrl = getLogoUrl(website)

  if (logoUrl && !failed) {
    return (
      <img
        src={logoUrl}
        alt={name}
        onError={() => setFailed(true)}
        className="h-9 w-9 rounded-lg object-contain border border-slate-100 bg-white p-1 shrink-0"
      />
    )
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-sm font-bold text-slate-500">
      {name[0].toUpperCase()}
    </div>
  )
}

export function CompanyCard({ company }: CompanyCardProps) {
  const filled = Math.round(company.avgRating)

  return (
    <Link
      href={`/company/${company.slug}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition-shadow duration-200 hover:shadow-md"
    >
      {/* Top row: logo + name + arrow */}
      <div className="flex items-start gap-3">
        <CompanyAvatar name={company.name} website={company.website} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="flex items-center gap-1 min-w-0">
              <h3 className="truncate text-sm font-semibold leading-snug text-slate-900">
                {company.name}
              </h3>
              {company.verified && (
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" />
              )}
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-all duration-200 group-hover:text-slate-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <p className="mt-0.5 text-xs text-slate-400 truncate">{company.category}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-3 border-t border-slate-100" />

      {/* Stars + count */}
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-3 w-3 ${
                s <= filled ? 'fill-blue-500 text-blue-500' : 'fill-slate-100 text-slate-100'
              }`}
            />
          ))}
          {company.avgRating > 0 && (
            <span className="ml-1 text-xs font-semibold text-slate-700">
              {company.avgRating.toFixed(1)}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">
          {company.reviewCount === 0
            ? 'No reviews yet'
            : `${company.reviewCount} ${company.reviewCount === 1 ? 'review' : 'reviews'}`}
        </span>
      </div>
    </Link>
  )
}
