import { Suspense } from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SearchBar } from '@/components/shared/search-bar'
import { CompanyCard } from '@/components/shared/company-card'
import { LeaderboardDropdown } from '@/components/shared/leaderboard-dropdown'
import { Building2, ArrowRight } from 'lucide-react'
import prisma from '@/lib/prisma'

export const revalidate = 60

function CompaniesSkeleton() {
  return (
    <div className="flex-1">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-6 w-36 animate-pulse rounded bg-slate-100" />
        <div className="h-5 w-28 animate-pulse rounded bg-slate-100" />
        <div className="h-5 w-28 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1,2,3,4,5,6,7,8].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  )
}

async function CompaniesSection() {
  type CompanyRow = {
    id: string; name: string; slug: string; category: string; district: string
    website: string | null; verified: boolean; avg_rating: number | null; review_count: bigint
  }
  let allCompanies: any[] = []
  let topRanked: any[] = []

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const [rows, ranked] = await Promise.all([
          prisma.$queryRaw<CompanyRow[]>`
            SELECT c.id, c.name, c.slug, c.category, c.district, c.website, c.verified,
              AVG(r.rating)::float AS avg_rating, COUNT(r.id) AS review_count
            FROM "Company" c
            LEFT JOIN "Review" r ON r."companyId" = c.id
            GROUP BY c.id ORDER BY c."createdAt" DESC
          `,
          prisma.$queryRaw<any[]>`
            SELECT c.id, c.name, c.slug, c.category, c.website,
              AVG(r.rating)::float AS avg_rating,
              COUNT(r.id) AS review_count
            FROM "Company" c
            INNER JOIN "Review" r ON r."companyId" = c.id
            GROUP BY c.id
            ORDER BY AVG(r.rating) DESC, COUNT(r.id) DESC
            LIMIT 8
          `,
        ])
        allCompanies = rows.map((r) => ({
          ...r,
          avgRating: r.avg_rating ? Number(r.avg_rating.toFixed(1)) : 0,
          reviewCount: Number(r.review_count),
        }))
        topRanked = ranked.map((r, i) => ({
          ...r,
          rank: i + 1,
          avgRating: r.avg_rating ? Number(r.avg_rating.toFixed(1)) : 0,
          reviewCount: Number(r.review_count),
        }))
        break
      } catch (err: any) {
        if (attempt === 1 || err?.code !== 'P1001') break
        await new Promise((res) => setTimeout(res, 2500))
      }
    }
  } catch (err) { console.error('[CompaniesSection]', err) }

  return (
    <div className="flex-1 min-w-0">
      {/* Heading + inline controls */}
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900">All Businesses</h2>
        {topRanked.length > 0 && (
          <div className="ml-auto">
            <LeaderboardDropdown companies={topRanked} />
          </div>
        )}
      </div>

      {allCompanies.length === 0 ? (
        <div className="rounded-xl border border-slate-200 p-16 text-center">
          <Building2 className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">No companies yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allCompanies.slice(0, 12).map((c) => <CompanyCard key={c.id} company={c} />)}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/leaderboard"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-blue-200 hover:text-blue-600">
          View all {allCompanies.length} companies <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="whitespace-nowrap font-[family-name:var(--font-playfair)] text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Find a company you can trust
            </h1>
            <div className="mt-10 mx-auto w-full" style={{ maxWidth: '640px' }}>
              <SearchBar />
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-slate-500">
                <span>No fake reviews</span>
                <span className="text-slate-300">·</span>
                <span>No spam</span>
                <span className="text-slate-300">·</span>
                <span>Real experiences from real people</span>
                <span className="text-slate-300">·</span>
                <span>Verified by a small payment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Companies */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <Suspense fallback={<CompaniesSkeleton />}>
          <CompaniesSection />
        </Suspense>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-10">
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
