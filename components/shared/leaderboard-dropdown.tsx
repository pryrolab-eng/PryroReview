'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

interface RankedCompany {
  id: string; rank: number; name: string; slug: string
  category: string; website: string | null; avgRating: number; reviewCount: number
}

const SORT_OPTIONS = [
  { label: 'Top Rated', value: 'top_rated' },
  { label: 'Most Reviewed', value: 'most_reviewed' },
] as const

type SortKey = (typeof SORT_OPTIONS)[number]['value']

export function LeaderboardDropdown({ companies }: { companies: RankedCompany[] }) {
  const [open, setOpen] = useState(false)
  const [sort, setSort] = useState<SortKey>('top_rated')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sorted = [...companies]
    .sort((a, b) =>
      sort === 'most_reviewed'
        ? b.reviewCount - a.reviewCount
        : b.avgRating - a.avgRating || b.reviewCount - a.reviewCount
    )
    .map((c, i) => ({ ...c, rank: i + 1 }))

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-700 hover:text-zinc-950 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
      >
        Leaderboard
        <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-64 rounded-xl border border-gray-200 bg-white shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Top Companies</span>
            <Link href="/leaderboard" onClick={() => setOpen(false)}
              className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap">
              View all →
            </Link>
          </div>

          {/* Sort tabs */}
          <div className="flex gap-1 mb-3 border-b border-gray-100 pb-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  sort === opt.value
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <ul className="space-y-0.5">
            {sorted.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/company/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors"
                >
                  <span className="w-5 shrink-0 text-center text-xs font-bold text-blue-600">
                    #{c.rank}
                  </span>
                  <span className="flex-1 truncate text-sm font-medium text-zinc-900">
                    {c.name}
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-amber-500">
                    {c.avgRating > 0 ? `${c.avgRating.toFixed(1)} ★` : '—'}
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
