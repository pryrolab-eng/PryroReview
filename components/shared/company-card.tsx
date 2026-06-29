import Link from 'next/link'
import { ChevronRight, ShieldCheck } from 'lucide-react'
import { StarRating } from '@/components/shared/star-rating'

interface CompanyCardProps {
  company: {
    id: string
    name: string
    slug: string
    category: string
    district?: string
    verified?: boolean
    avgRating: number
    reviewCount: number
  }
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link
      href={`/company/${company.slug}`}
      className="group block rounded-xl border border-zinc-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-zinc-900">
              {company.name}
            </h3>
            {company.verified && (
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-500">{company.category}</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-900" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <StarRating rating={company.avgRating} size="sm" />
        <span className="text-sm font-medium text-orange-500">
          {company.reviewCount}{' '}
          {company.reviewCount === 1 ? 'review' : 'reviews'}
        </span>
      </div>
    </Link>
  )
}
