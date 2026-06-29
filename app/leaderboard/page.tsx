'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { StarRating } from '@/components/shared/star-rating'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RankedCompany {
  id: string; name: string; slug: string; category: string
  district: string; verified: boolean; avg_rating: number
  review_count: number; rank: number
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'best' | 'worst'>('best')
  const [companies, setCompanies] = useState<RankedCompany[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?type=${tab}&page=${page}`)
      if (res.ok) { const d = await res.json(); setCompanies(d.companies); setTotalPages(d.totalPages) }
    } finally { setLoading(false) }
  }, [tab, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [tab])

  return (
    <div className="animate-fade-up mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          {tab === 'best' ? 'Best rated companies in Rwanda' : 'Worst rated companies in Rwanda'}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
        {(['best', 'worst'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-md px-5 py-2 text-sm font-medium transition-all duration-150',
              tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            {t === 'best' ? 'Best Rated' : 'Worst Rated'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-xl border border-slate-200 p-16 text-center">
          <p className="text-sm text-slate-400">No companies with reviews yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['#', 'Company', 'Rating', 'Reviews'].map((h, i) => (
                  <th
                    key={h}
                    className={cn(
                      'px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400',
                      i === 0 ? 'w-12 text-center' : i === 3 ? 'text-right' : 'text-left'
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/company/${c.slug}`)}
                  className="group cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-blue-50"
                >
                  <td className="px-4 py-4 text-center">
                    <span className={cn(
                      'inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold',
                      c.rank <= 3
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                    )}>
                      {c.rank}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {c.name}
                      </p>
                      {c.verified && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{c.category} · {c.district}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {c.avg_rating.toFixed(1)}
                      </span>
                      <StarRating rating={c.avg_rating} size="sm" />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-medium text-blue-600">
                    {c.review_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)} disabled={page === 1}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-3 text-sm text-slate-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)} disabled={page === totalPages}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
