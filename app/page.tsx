import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SearchBar } from '@/components/shared/search-bar'
import { CompanyCard } from '@/components/shared/company-card'
import { StarRating } from '@/components/shared/star-rating'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import { Building2, Star, MapPin, ArrowRight, ShieldCheck } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'

export const revalidate = 60

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  let totalReviews = 0, totalCompanies = 0
  let allCompanies: any[] = [], latestReviews: any[] = []

  try {
    ;[totalReviews, totalCompanies, allCompanies, latestReviews] = await Promise.all([
      prisma.review.count(),
      prisma.company.count(),
      prisma.company.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { reviews: true } } },
      }),
      prisma.review.findMany({
        orderBy: { createdAt: 'desc' }, take: 4,
        include: {
          user: { select: { fullName: true } },
          company: { select: { name: true, slug: true } },
        },
      }),
    ])
  } catch (err) { console.error('[HomePage] DB:', err) }

  const uniqueDistricts = new Set(allCompanies.map((c) => c.district)).size

  const companiesWithScores = await Promise.all(
    allCompanies.map(async (company) => {
      try {
        const agg = await prisma.review.aggregate({
          where: { companyId: company.id },
          _avg: { rating: true }, _count: { id: true },
        })
        return { ...company, avgRating: agg._avg.rating ? Number(agg._avg.rating.toFixed(1)) : 0, reviewCount: agg._count.id }
      } catch { return { ...company, avgRating: 0, reviewCount: 0 } }
    })
  )

  const categories = Array.from(new Set(allCompanies.map((c) => c.category))).sort()
  const mostReviewed = [...companiesWithScores]
    .filter((c) => c.reviewCount > 0)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 6)

  return (
    <div className="animate-fade-up">

      {/* ── Hero ── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-medium text-blue-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              Every review verified with 100 RWF
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
              Honest reviews for<br />
              <span className="text-blue-600">Rwandan businesses</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-slate-500 sm:text-lg">
              No fake reviews. No spam. Real experiences from real people,
              verified by a small payment.
            </p>
            <div className="mt-10">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
            {[
              { icon: Star, value: totalReviews, label: 'Verified Reviews' },
              { icon: Building2, value: totalCompanies, label: 'Companies Listed' },
              { icon: MapPin, value: uniqueDistricts, label: 'Districts Covered' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
                  <Icon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold tabular-nums text-slate-900">
                    <AnimatedCounter value={value} />
                  </p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row">

          {/* Categories sidebar */}
          <aside className="lg:w-52 lg:shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Filter by category
            </p>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/"
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50"
                >
                  <span>All</span>
                  <span className="text-xs font-medium text-blue-400">{allCompanies.length}</span>
                </Link>
              </li>
              {categories.map((cat) => {
                const count = allCompanies.filter((c) => c.category === cat).length
                return (
                  <li key={cat}>
                    <Link
                      href={`/?category=${encodeURIComponent(cat)}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      <span>{cat}</span>
                      <span className="text-xs text-slate-400">{count}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </aside>

          {/* Company grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">All Businesses</h2>
              <Link
                href="/leaderboard"
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Leaderboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {companiesWithScores.length === 0 ? (
              <div className="rounded-xl border border-slate-200 p-16 text-center">
                <Building2 className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm text-slate-400">No companies yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {companiesWithScores.slice(0, 9).map((c) => (
                  <CompanyCard key={c.id} company={c} />
                ))}
              </div>
            )}

            <div className="mt-8 text-center">
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-blue-200 hover:text-blue-600"
              >
                View all {totalCompanies} companies <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Most Reviewed ── */}
      {mostReviewed.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900">Most Reviewed</h2>
              <p className="mt-1 text-sm text-slate-500">Companies with the most community feedback</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mostReviewed.map((c) => <CompanyCard key={c.id} company={c} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Latest Reviews ── */}
      {latestReviews.length > 0 && (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900">Latest Reviews</h2>
              <p className="mt-1 text-sm text-slate-500">What people are saying right now</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {latestReviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/company/${review.company?.slug}`}
                  className="group block rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-[0_4px_24px_0_rgba(37,99,235,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                        {review.company?.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {review.user?.fullName || 'Anonymous'} ·{' '}
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <StarRating rating={review.rating} size="sm" className="shrink-0" />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
                    {review.comment}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="border-t border-blue-100 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Had an experience worth sharing?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-blue-100">
            Review any company in Rwanda. Verified for just 100 RWF — no fake reviews, no spam.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {session ? (
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
              >
                Write a Review <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Browse Leaderboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
