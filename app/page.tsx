import { Suspense } from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SearchBar } from '@/components/shared/search-bar'
import { CompanyCard } from '@/components/shared/company-card'
import { LeaderboardDropdown } from '@/components/shared/leaderboard-dropdown'
import { LogoStrip } from '@/components/shared/logo-strip'
import { Button } from '@/components/ui/button'
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
          <Building2 className="mx-auto h-8 w-8 text-zinc-900" />
          <p className="mt-3 text-sm text-zinc-900">No companies yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {allCompanies.slice(0, 12).map((c) => <CompanyCard key={c.id} company={c} />)}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/leaderboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:underline">
          View all {allCompanies.length} companies <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // Fetch companies with websites for the logo strip
  let logoCompanies: { id: string; name: string; website: string }[] = []
  try {
    const rows = await prisma.company.findMany({
      where: { website: { not: null } },
      select: { id: true, name: true, website: true },
      take: 24,
      orderBy: { createdAt: 'desc' },
    })
    logoCompanies = rows
      .filter((r) => r.website)
      .map((r) => ({ id: r.id, name: r.name, website: r.website! }))
  } catch {}

  return (
    <div>
      {/* Hero */}
      <section className="bg-white">
        <div className="w-full px-6 py-20 md:py-28 lg:px-10">
          <div className="flex flex-col items-center text-center gap-6">

            {/* Badge */}
            <span className="inline-flex items-center rounded-full border border-zinc-900 bg-white px-4 py-1 text-xs text-zinc-900 font-medium">
              20 RWF per verified review
            </span>

            {/* Heading */}
            <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 md:text-6xl">
              Find a company you can trust
            </h1>

            {/* Search — wider than the heading */}
            <div className="w-full max-w-4xl">
              <SearchBar />
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-900">
              <span>No fake reviews</span>
              <span className="h-3 w-px bg-zinc-200" aria-hidden="true" />
              <span>No spam</span>
              <span className="h-3 w-px bg-zinc-200" aria-hidden="true" />
              <span>Real experiences from real people</span>
              <span className="h-3 w-px bg-zinc-200" aria-hidden="true" />
              <span>Verified by a small payment</span>
            </div>

          </div>
        </div>

        {/* Scrolling logo strip */}
        {logoCompanies.length > 0 && (
          <LogoStrip companies={logoCompanies} />
        )}
      </section>

      {/* Companies */}
      <section className="w-full px-6 py-10 lg:px-10">
        <Suspense fallback={<CompaniesSkeleton />}>
          <CompaniesSection />
        </Suspense>
      </section>

      {/* CTA + App Preview */}
      <section className="bg-white">
        <div className="w-full px-6 py-16 lg:px-10 lg:py-24">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">

            {/* ── Left: description ── */}
            <div className="flex-1 lg:max-w-lg">
              <span className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-900">
                PryroReview — verified business reviews
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
                Honest reviews you can actually trust
              </h2>
              <p className="mt-4 text-base text-zinc-900 leading-relaxed">
                Every review on PryroReview is verified with a 20 RWF MTN MoMo payment — making spam and fake reviews economically unviable. Real experiences from real customers.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Verified by a small payment — no bots',
                  'Search any business on PryroReview',
                  'See ratings across all categories',
                  'Add businesses not yet in the directory',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-900">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-900" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Right: mock app UI ── */}
            <div className="w-full flex-1 lg:max-w-xl">
              <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-white px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
                  <span className="mx-auto text-[11px] font-medium tracking-widest text-zinc-900">PRYRO REVIEW</span>
                  <span className="h-6 w-6 rounded-full bg-zinc-100" />
                </div>

                <div className="flex h-full">
                  {/* Sidebar */}
                  <div className="w-36 shrink-0 border-r border-zinc-200 bg-white p-4">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-zinc-900">Navigate</p>
                    {['Dashboard', 'Businesses', 'My Reviews', 'Leaderboard', 'Add Business'].map((item, i) => (
                      <div key={item} className={`mb-1 rounded-md px-2.5 py-1.5 text-xs ${i === 0 ? 'bg-zinc-950 font-semibold text-white' : 'text-zinc-900'}`}>
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 p-5">
                    <p className="text-xs font-bold text-zinc-900 mb-3">Top Rated This Week</p>

                    {/* Stat row */}
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      {[
                        { label: 'Total Businesses', value: '116' },
                        { label: 'Verified Reviews', value: '1,240+' },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl border border-zinc-100 bg-white p-3">
                          <p className="text-[10px] text-zinc-900">{s.label}</p>
                          <p className="mt-1 text-lg font-extrabold text-zinc-900">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Rating bars */}
                    <div className="rounded-xl border border-zinc-100 bg-white p-3">
                      <p className="mb-3 text-[10px] font-bold text-zinc-900">Category Scores</p>
                      {[
                        { name: 'Telecommunications', pct: 82, color: 'bg-zinc-900' },
                        { name: 'Banking & Finance', pct: 67, color: 'bg-zinc-600' },
                        { name: 'Government Services', pct: 54, color: 'bg-zinc-400' },
                      ].map((bar) => (
                        <div key={bar.name} className="mb-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-zinc-900">{bar.name}</span>
                            <span className="text-[10px] font-semibold text-zinc-900">{bar.pct}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-zinc-100">
                            <div className={`h-1.5 rounded-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
