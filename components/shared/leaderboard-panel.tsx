'use client'

import { useState } from 'react'
import Link from 'next/link'

interface RankedCompany {
  id: string; rank: number; name: string; slug: string
  category: string; website: string | null; avgRating: number; reviewCount: number
}

const SORT_OPTIONS = [
  { label: 'Top Rated', value: 'top_rated' },
  { label: 'Most Reviewed', value: 'most_reviewed' },
] as const

type SortKey = (typeof SORT_OPTIONS)[number]['value']

function CompanyLogo({ name, website }: { name: string; website?: string | null }) {
  const [failed, setFailed] = useState(false)
  const domain = website
    ? (() => { try { return new URL(website).hostname.replace(/^www\./, '') } catch { return null } })()
    : null

  if (domain && !failed) {
    return (
      <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
        alt={name} onError={() => setFailed(true)}
        className="h-6 w-6 rounded object-contain shrink-0" />
    )
  }
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-zinc-200 bg-white text-[10px] font-bold text-zinc-900">
      {name[0].toUpperCase()}
    </div>
  )
}

export function LeaderboardPanel({ companies }: { companies: RankedCompany[] }) {
  const [sort, setSort] = useState<SortKey>('top_rated')

  const sorted = [...companies].sort((a, b) =>
    sort === 'most_reviewed'
      ? b.reviewCount - a.reviewCount
      : b.avgRating - a.avgRating || b.reviewCount - a.reviewCount
  ).map((c, i) => ({ ...c, rank: i + 1 }))

  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="lg:hidden">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900">Leaderboard</h3>
          <Link href="/leaderboard" className="text-xs font-semibold text-blue-700 hover:underline">
            View all →
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {sorted.map((c) => (
            <Link key={c.id} href={`/company/${c.slug}`}
              className="shrink-0 w-44 rounded-md border border-zinc-200 bg-white p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-blue-700">#{c.rank}</span>
                <CompanyLogo name={c.name} website={c.website} />
              </div>
              <p className="text-xs font-semibold text-zinc-900 truncate">{c.name}</p>
              <p className="text-[11px] text-zinc-900 truncate">{c.category}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-zinc-900">
                <span className="font-semibold">{c.avgRating > 0 ? c.avgRating.toFixed(1) : '—'}</span>
                <span className="text-zinc-900">·</span>
                <span>{c.reviewCount} reviews</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: vertical panel */}
      <div className="hidden lg:block rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900">🏆 Leaderboard</h3>
          <Link href="/leaderboard" className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap">
            View all →
          </Link>
        </div>

        <ul>
          {sorted.map((c) => (
            <li key={c.id} className="border-b border-gray-100 last:border-0">
              <Link
                href={`/company/${c.slug}`}
                className="flex items-center gap-3 py-2.5 hover:bg-gray-50 rounded-lg px-1 transition-colors"
              >
                {/* Rank */}
                <span className="w-5 shrink-0 text-center text-xs font-bold text-blue-600">
                  #{c.rank}
                </span>

                {/* Logo/Avatar */}
                <CompanyLogo name={c.name} website={c.website} />

                {/* Name + stats */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-zinc-900">{c.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[11px] font-semibold text-amber-500">
                      {c.avgRating > 0 ? `${c.avgRating.toFixed(1)} ★` : '—'}
                    </span>
                    <span className="text-[11px] text-zinc-400">·</span>
                    <span className="text-[11px] text-zinc-400">{c.reviewCount} reviews</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
