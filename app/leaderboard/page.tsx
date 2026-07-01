'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Star, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
  if (rank <= 3) return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-xs font-bold text-white">{rank}</span>
  )
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold text-zinc-900">{rank}</span>
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
    <div className="w-full px-6 py-12 lg:px-10">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>
          <p className="mt-1 text-sm text-zinc-900">
            {tab === 'best'
              ? 'Top rated companies by verified reviews'
              : 'Lowest rated companies by verified reviews'}
          </p>
        </div>
        <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs">
          {tab === 'best'
            ? <><TrendingUp className="h-3.5 w-3.5 text-zinc-900" /> Best Rated</>
            : <><TrendingDown className="h-3.5 w-3.5 text-zinc-900" /> Worst Rated</>
          }
        </Badge>
      </div>

      {/* Tab switcher */}
      <div className="mb-6 inline-flex gap-1">
        {(['best', 'worst'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-semibold transition-colors',
              tab === t
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-900 hover:text-zinc-900'
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
          <p className="text-sm text-zinc-900">No companies with reviews yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-white hover:bg-white border-b border-zinc-100">
                <TableHead className="w-14 text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-900">#</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-900">Company</TableHead>
                <TableHead className="hidden sm:table-cell text-[11px] font-semibold uppercase tracking-wider text-zinc-900">Category</TableHead>
                <TableHead className="hidden md:table-cell text-[11px] font-semibold uppercase tracking-wider text-zinc-900">District</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-900">Rating</TableHead>
                <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-900">Reviews</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((c) => {
                const logoUrl = getLogoUrl(c.website)
                return (
                  <TableRow
                    key={c.id}
                    onClick={() => router.push(`/company/${c.slug}`)}
                    className="cursor-pointer hover:bg-zinc-50"
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
                          <AvatarFallback className="rounded-md border border-zinc-200 bg-white text-xs font-bold text-zinc-900">
                            {c.name[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-semibold text-slate-900">
                              {c.name}
                            </span>
                            {c.verified && (
                              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-700" />
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
                    <TableCell className="hidden md:table-cell py-3 text-sm text-zinc-900">
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
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setPage(p)}
                className="rounded-md"
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
