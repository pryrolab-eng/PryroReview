'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

interface RankedCompany {
  id: string
  rank: number
  name: string
  slug: string
  category: string
  website: string | null
  avgRating: number
  reviewCount: number
}

const SORT_OPTIONS = [
  { label: 'Top Rated',     value: 'top_rated' },
  { label: 'Most Reviewed', value: 'most_reviewed' },
] as const

type SortKey = (typeof SORT_OPTIONS)[number]['value']

export function LeaderboardDropdown({ companies }: { companies: RankedCompany[] }) {
  const [open, setOpen] = useState(false)
  const [sort, setSort] = useState<SortKey>('top_rated')

  const sorted = [...companies]
    .sort((a, b) =>
      sort === 'most_reviewed'
        ? b.reviewCount - a.reviewCount
        : b.avgRating - a.avgRating || b.reviewCount - a.reviewCount
    )
    .map((c, i) => ({ ...c, rank: i + 1 }))

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger */}
      <button
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-slate-600 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
      >
        Leaderboard
        <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 w-60 rounded-md border border-zinc-200 bg-white shadow-md">
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Top Companies</span>
            <Link
              href="/leaderboard"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
            >
              View all →
            </Link>
          </div>

          {/* Sort toggle */}
          <div className="flex gap-1 border-b border-zinc-100 px-2.5 py-1.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  sort === opt.value
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Ranked list — name rows only */}
          <ul className="py-1">
            {sorted.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/company/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-1.5 transition-colors hover:bg-slate-50 group"
                >
                  <span className="w-4 shrink-0 text-center text-[11px] font-bold text-slate-400">
                    {c.rank}
                  </span>
                  <span className="flex-1 truncate text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                    {c.name}
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-slate-500">
                    {c.avgRating > 0 ? c.avgRating.toFixed(1) : '—'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
