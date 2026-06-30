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

      {/* Tabs — full width on mobile */}
      <div className="mb-6 flex w-full gap-2 sm:inline-flex sm:w-auto sm:rounded-lg sm:border sm:border-slate-200 sm:bg-slate-50 sm:p-1 sm:gap-0">
        {(['best', 'worst'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-150 sm:flex-none sm:rounded-md sm:py-2',
              tab === t
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200 sm:border-0'
                : 'text-slate-500 hover:text-slate-900 border border-slate-200 sm:border-0'
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
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="w-12 px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">#</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Company</th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:table-cell">District</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Rating</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Reviews</th>
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
                    <p className="text-xs text-slate-400 mt-0.5">{c.category}</p>
                  </td>
                  <td className="hidden px-4 py-4 text-sm text-slate-500 sm:table-cell">{c.district}</td>
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
            className="min-h-[44px] rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-3 text-sm text-slate-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)} disabled={page === totalPages}
            className="min-h-[44px] rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
