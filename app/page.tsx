import { Suspense } from 'react'
import { SearchHero } from '@/components/shared/search-hero'
import { CompaniesGrid } from '@/components/shared/companies-grid'
import prisma, { withRetry } from '@/lib/prisma'

export const revalidate = 60

function CompaniesSkeleton() {
  return (
    <div className="flex gap-6">
      {/* Left sidebar skeleton */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="h-5 w-48 animate-pulse rounded bg-slate-100 mb-4" />
        {[1,2,3,4,5,6,7].map((i) => (
          <div key={i} className="mb-3 h-8 animate-pulse rounded bg-slate-100" />
        ))}
      </div>
      {/* Center skeleton */}
      <div className="flex-1 min-w-0">
        <div className="mb-5 h-6 w-36 animate-pulse rounded bg-slate-100" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
      {/* Right sidebar skeleton */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="h-4 w-36 animate-pulse rounded bg-slate-100 mb-4" />
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="mb-4 h-10 animate-pulse rounded bg-slate-100" />
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
  type BadReviewRow = {
    id: string; name: string; slug: string; category: string
    website: string | null; bad_review_count: bigint
  }

  let allCompanies: any[] = []
  let topRanked: any[] = []
  let badReviewCompanies: any[] = []
  let categories: string[] = []

  try {
    const [rows, ranked, badRows] = await withRetry(() =>
      Promise.all([
        // All companies with avg rating
        prisma.$queryRaw<CompanyRow[]>`
          SELECT c.id, c.name, c.slug, c.category, c.district, c.website, c.verified,
            COALESCE(AVG(NULLIF(r.rating, 0)), 0)::float AS avg_rating,
            COUNT(r.id) AS review_count
          FROM "Company" c
          LEFT JOIN "Review" r ON r."companyId" = c.id
          GROUP BY c.id
          ORDER BY
            CASE WHEN COUNT(r.id) = 0 THEN 1 ELSE 0 END ASC,
            AVG(NULLIF(r.rating, 0)) DESC,
            COUNT(r.id) DESC,
            c."createdAt" DESC
        `,
        // Top 10 for leaderboard panel
        prisma.$queryRaw<any[]>`
          SELECT c.id, c.name, c.slug, c.category, c.website,
            AVG(NULLIF(r.rating, 0))::float AS avg_rating,
            COUNT(r.id) AS review_count
          FROM "Company" c
          INNER JOIN "Review" r ON r."companyId" = c.id
          GROUP BY c.id
          ORDER BY AVG(NULLIF(r.rating, 0)) DESC, COUNT(r.id) DESC
          LIMIT 10
        `,
        // Bad reviews: companies that have reviews with rating = 0 or 1 (no stars / 1 star)
        prisma.$queryRaw<BadReviewRow[]>`
          SELECT c.id, c.name, c.slug, c.category, c.website,
            COUNT(r.id) AS bad_review_count
          FROM "Company" c
          INNER JOIN "Review" r ON r."companyId" = c.id
          WHERE r.rating <= 1
          GROUP BY c.id
          ORDER BY COUNT(r.id) DESC
        `,
      ])
    )

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

    badReviewCompanies = badRows.map((r) => ({
      ...r,
      badReviewCount: Number(r.bad_review_count),
    }))

    // Unique sorted categories from all companies
    const catSet = new Set(allCompanies.map((c) => c.category as string).filter(Boolean))
    categories = Array.from(catSet).sort()
  } catch (err) {
    console.error('[CompaniesSection]', err)
    if (process.env.NODE_ENV === 'development') {
      throw err
    }
  }

  return (
    <CompaniesGrid
      allCompanies={allCompanies}
      topRanked={topRanked}
      badReviewCompanies={badReviewCompanies}
      categories={categories}
    />
  )
}

export default async function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto max-w-screen-2xl px-4 pt-8 pb-10 sm:px-6 md:pt-12 md:pb-14 lg:px-10">
          <SearchHero />
        </div>
      </section>

      {/* Companies */}
      <section className="mx-auto max-w-screen-2xl w-full px-4 py-10 sm:px-6 lg:px-10">
        <Suspense fallback={<CompaniesSkeleton />}>
          <CompaniesSection />
        </Suspense>
      </section>
    </div>
  )
}
