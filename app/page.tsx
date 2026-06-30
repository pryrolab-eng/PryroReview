import { Suspense } from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SearchBar } from '@/components/shared/search-bar'
import { CompanyCard } from '@/components/shared/company-card'
import { StarRating } from '@/components/shared/star-rating'
import { Building2, ArrowRight, ShieldCheck } from 'lucide-react'
import prisma from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'

export const revalidate = 60

// ─── Skeleton shown while companies load ───────────────────────────────────
function CompaniesSkeleton() {
  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <aside className="hidden lg:block lg:w-52 lg:shrink-0">
        <div className="h-3 w-28 animate-pulse rounded bg-slate-100 mb-4" />
        <div className="space-y-1">
          {[1,2,3,4,5,6,7].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </aside>
      <div className="flex-1">
        <div className="h-6 w-32 animate-pulse rounded bg-slate-100 mb-6" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1,2,3,4,5,6,7,8,9].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Async server component — fetches and renders companies ────────────────
async function CompaniesSection() {
  type CompanyRow = {
    id: string; name: string; slug: string; category: string; district: string
    website: string | null; verified: boolean; avg_rating: number | null; review_count: bigint
  }

  let allCompanies: any[] = []

  try {
    // Retry once for Neon cold start
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const rows = await prisma.$queryRaw<CompanyRow[]>`
          SELECT
            c.id, c.name, c.slug, c.category, c.district, c.website, c.verified,
            AVG(r.rating)::float AS avg_rating,
            COUNT(r.id)          AS review_count
          FROM "Company" c
          LEFT JOIN "Review" r ON r."companyId" = c.id
          GROUP BY c.id
          ORDER BY c."createdAt" DESC
        `
        allCompanies = rows.map((r) => ({
          ...r,
          avgRating: r.avg_rating ? Number(r.avg_rating.toFixed(1)) : 0,
          reviewCount: Number(r.review_count),
        }))
        break
      } catch (err: any) {
        if (attempt === 1 || err?.code !== 'P1001') break
        await new Promise((res) => setTimeout(res, 2500))
      }
    }
  } catch (err) {
    console.error('[CompaniesSection]', err)
  }

  const categories = Array.from(new Set(allCompanies.map((c) => c.category))).sort()

  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      {/* Mobile: horizontal scrollable category bar */}
      <div className="lg:hidden -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Link href="/"
            className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 whitespace-nowrap">
            All ({allCompanies.length})
          </Link>
          {categories.map((cat) => {
            const count = allCompanies.filter((c) => c.category === cat).length
            return (
              <Link key={cat} href={`/?category=${encodeURIComponent(cat)}`}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 whitespace-nowrap hover:border-slate-300 hover:text-slate-900 transition-colors">
                {cat} ({count})
              </Link>
            )
          })}
        </div>
      </div>

      {/* Desktop: Categories sidebar */}
      <aside className="hidden lg:block lg:w-52 lg:shrink-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Filter by category
        </p>
        <ul className="space-y-0.5">
          <li>
            <Link href="/" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50">
              <span>All</span>
              <span className="text-xs font-medium text-blue-400">{allCompanies.length}</span>
            </Link>
          </li>
          {categories.map((cat) => {
            const count = allCompanies.filter((c) => c.category === cat).length
            return (
              <li key={cat}>
                <Link href={`/?category=${encodeURIComponent(cat)}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
                  <span>{cat}</span>
                  <span className="text-xs text-slate-400">{count}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </aside>

      {/* Grid */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">All Businesses</h2>
          <Link href="/leaderboard" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
            Leaderboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {allCompanies.length === 0 ? (
          <div className="rounded-xl border border-slate-200 p-16 text-center">
            <Building2 className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">No companies yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {allCompanies.slice(0, 9).map((c) => <CompanyCard key={c.id} company={c} />)}
          </div>
        )}
        <div className="mt-8 text-center">
          <Link href="/leaderboard"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-blue-200 hover:text-blue-600">
            View all {allCompanies.length} companies <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Async component for most reviewed + latest reviews ───────────────────
async function ReviewsSection() {
  let mostReviewed: any[] = []
  let latestReviews: any[] = []

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const [rows, reviews] = await Promise.all([
          prisma.$queryRaw<any[]>`
            SELECT c.id, c.name, c.slug, c.category, c.district, c.website, c.verified,
              AVG(r.rating)::float AS avg_rating, COUNT(r.id) AS review_count
            FROM "Company" c
            INNER JOIN "Review" r ON r."companyId" = c.id
            GROUP BY c.id
            ORDER BY COUNT(r.id) DESC
            LIMIT 6
          `,
          prisma.review.findMany({
            orderBy: { createdAt: 'desc' }, take: 4,
            include: {
              user: { select: { fullName: true } },
              company: { select: { name: true, slug: true } },
            },
          }),
        ])
        mostReviewed = rows.map((r) => ({
          ...r,
          avgRating: r.avg_rating ? Number(r.avg_rating.toFixed(1)) : 0,
          reviewCount: Number(r.review_count),
        }))
        latestReviews = reviews
        break
      } catch (err: any) {
        if (attempt === 1 || err?.code !== 'P1001') break
        await new Promise((res) => setTimeout(res, 2500))
      }
    }
  } catch (err) {
    console.error('[ReviewsSection]', err)
  }

  return (
    <>
      {mostReviewed.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Most Reviewed</h2>
            <p className="text-sm text-slate-500 mb-8">Companies with the most community feedback</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mostReviewed.map((c) => <CompanyCard key={c.id} company={c} />)}
            </div>
          </div>
        </section>
      )}

      {latestReviews.length > 0 && (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Latest Reviews</h2>
            <p className="text-sm text-slate-500 mb-8">What people are saying right now</p>
            <div className="grid gap-4 md:grid-cols-2">
              {latestReviews.map((review) => (
                <Link key={review.id} href={`/company/${review.company?.slug}`}
                  className="group block rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-[0_4px_24px_0_rgba(37,99,235,0.08)]">
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
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

// ─── Main page — renders hero instantly, streams the rest ─────────────────
export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div>
      {/* Hero — no DB, renders instantly */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-medium text-blue-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              Every review verified with 20 RWF
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
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

      {/* Companies — streams in while hero is already visible */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Suspense fallback={<CompaniesSkeleton />}>
          <CompaniesSection />
        </Suspense>
      </section>

      {/* Reviews sections — stream last */}
      <Suspense fallback={null}>
        <ReviewsSection />
      </Suspense>

      {/* CTA — no DB, always instant */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Had an experience worth sharing?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-slate-500">
            Review any company in Rwanda. Verified for just 20 RWF — no fake reviews, no spam.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {session ? (
              <Link href="/" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto">
                Write a Review <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/register" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link href="/leaderboard" className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-600 sm:w-auto">
              Browse Leaderboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
