'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Star, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface RankedCompany {
  id: string; name: string; slug: string; category: string
  district: string; verified: boolean; avg_rating: number
  review_count: number; rank: number; website?: string | null
}

function getLogoUrl(website?: string | null): string | null {
  if (!website) return null
  try {
    const domain = new URL(website).hostname.replace(/^www\./, '')
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch { return null }
}

function StarDisplay({ rating }: { rating: number }) {
  const filled = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3 w-3 ${s <= filled ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-100'}`}
        />
      ))}
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">1</span>
  )
  if (rank === 2) return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">2</span>
  )
  if (rank === 3) return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-500 text-xs font-bold text-white">3</span>
  )
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">{rank}</span>
  )
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
      if (res.ok) {
        const d = await res.json()
        setCompanies(d.companies)
        setTotalPages(d.totalPages)
      }
    } finally { setLoading(false) }
  }, [tab, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [tab])

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {tab === 'best'
              ? 'Top rated companies in Rwanda by verified reviews'
              : 'Lowest rated companies in Rwanda by verified reviews'}
          </p>
        </div>
        <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs">
          {tab === 'best'
            ? <><TrendingUp className="h-3.5 w-3.5 text-slate-700" /> Best Rated</>
            : <><TrendingDown className="h-3.5 w-3.5 text-slate-700" /> Worst Rated</>
          }
        </Badge>
      </div>

      {/* Tab switcher */}
      <div className="mb-6 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 gap-1">
        {(['best', 'worst'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-150',
              tab === t
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            {t === 'best' ? 'Best Rated' : 'Worst Rated'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-xl border border-slate-200 p-16 text-center">
          <p className="text-sm text-slate-400">No companies with reviews yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-14 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">#</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Company</TableHead>
                <TableHead className="hidden sm:table-cell text-[11px] font-semibold uppercase tracking-wider text-slate-400">Category</TableHead>
                <TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wider text-slate-400">District</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Rating</TableHead>
                <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Reviews</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((c) => {
                const logoUrl = getLogoUrl(c.website)
                return (
                  <TableRow
                    key={c.id}
                    onClick={() => router.push(`/company/${c.slug}`)}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    {/* Rank */}
                    <TableCell className="text-center py-3">
                      <RankBadge rank={c.rank} />
                    </TableCell>

                    {/* Company */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage src={logoUrl ?? ''} className="object-contain p-0.5" />
                          <AvatarFallback className="rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                            {c.name[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-semibold text-slate-900">
                              {c.name}
                            </span>
                            {c.verified && (
                              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-slate-900" />
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="hidden sm:table-cell py-3">
                      <Badge variant="secondary" className="text-[11px] font-medium">
                        {c.category}
                      </Badge>
                    </TableCell>

                    {/* District */}
                    <TableCell className="hidden md:table-cell py-3 text-sm text-slate-500">
                      {c.district}
                    </TableCell>

                    {/* Rating */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 tabular-nums">
                          {c.avg_rating.toFixed(1)}
                        </span>
                        <StarDisplay rating={c.avg_rating} />
                      </div>
                    </TableCell>

                    {/* Review count */}
                    <TableCell className="py-3 text-right">
                      <span className="text-sm font-semibold text-slate-900 tabular-nums">
                        {c.review_count}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'h-8 w-8 rounded-full text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
