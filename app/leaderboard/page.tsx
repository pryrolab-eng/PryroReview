'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { StarRating } from '@/components/shared/star-rating'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RankedCompany {
  id: string
  name: string
  slug: string
  category: string
  district: string
  verified: boolean
  avg_rating: number
  review_count: number
  rank: number
}

const PAGE_SIZE = 10

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'best' | 'worst'>('best')
  const [companies, setCompanies] = useState<RankedCompany[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const loadLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?type=${tab}&page=${page}`)
      if (res.ok) {
        const data = await res.json()
        setCompanies(data.companies)
        setTotalPages(data.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }, [tab, page])

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard])

  useEffect(() => {
    setPage(1)
  }, [tab])

  return (
    <div className="animate-fade-up">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="text-4xl font-black tracking-tight text-zinc-900">
          Leaderboard
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {tab === 'best'
            ? 'Best rated companies in Rwanda'
            : 'Worst rated companies in Rwanda'}
        </p>

        <div className="mt-8 inline-flex rounded-full border border-zinc-100 p-1">
          <button
            onClick={() => setTab('best')}
            className={cn(
              'rounded-full px-6 py-2 text-sm font-medium transition-all',
              tab === 'best'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-500 hover:text-zinc-900'
            )}
          >
            Best Rated
          </button>
          <button
            onClick={() => setTab('worst')}
            className={cn(
              'rounded-full px-6 py-2 text-sm font-medium transition-all',
              tab === 'worst'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-500 hover:text-zinc-900'
            )}
          >
            Worst Rated
          </button>
        </div>

        {loading ? (
          <div className="mt-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-zinc-100"
              />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="mt-8 rounded-xl border border-zinc-100 p-12 text-center">
            <p className="text-sm text-zinc-500">
              No companies with reviews yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-xl border border-zinc-100">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Score
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Reviews
                  </th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    onClick={() =>
                      (window.location.href = `/company/${company.slug}`)
                    }
                    className="cursor-pointer border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50"
                  >
                    <td className="px-4 py-4 text-sm font-bold text-zinc-400">
                      {company.rank}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-zinc-900">
                        {company.name}
                      </p>
                      <p className="text-xs text-zinc-500">{company.category}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-sm font-bold',
                            company.avg_rating >= 4
                              ? 'text-emerald-600'
                              : company.avg_rating >= 3
                              ? 'text-zinc-900'
                              : 'text-red-500'
                          )}
                        >
                          {company.avg_rating.toFixed(1)}
                        </span>
                        <StarRating rating={company.avg_rating} size="sm" />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-orange-500">
                      {company.review_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
