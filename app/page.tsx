import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SearchBar } from '@/components/shared/search-bar'
import { CompanyCard } from '@/components/shared/company-card'
import { StarRating } from '@/components/shared/star-rating'
import { AnimatedCounter } from '@/components/shared/animated-counter'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'

export const revalidate = 60

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  let totalReviews = 0
  let totalCompanies = 0
  let allCompanies: any[] = []
  let latestReviews: any[] = []

  try {
    ;[totalReviews, totalCompanies, allCompanies, latestReviews] =
      await Promise.all([
        prisma.review.count(),
        prisma.company.count(),
        prisma.company.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { reviews: true } },
          },
        }),
        prisma.review.findMany({
          orderBy: { createdAt: 'desc' },
          take: 4,
          include: {
            user: { select: { fullName: true } },
            company: { select: { name: true, slug: true } },
          },
        }),
      ])
  } catch (err) {
    console.error('[HomePage] DB error:', err)
    // DB is waking up — render the shell, it will refresh shortly
  }

  const uniqueDistricts = new Set(allCompanies.map((c) => c.district)).size

  // Calculate avg ratings
  const companiesWithScores = await Promise.all(
    allCompanies.map(async (company) => {
      try {
        const agg = await prisma.review.aggregate({
          where: { companyId: company.id },
          _avg: { rating: true },
          _count: { id: true },
        })
        return {
          ...company,
          avgRating: agg._avg.rating ? Number(agg._avg.rating.toFixed(1)) : 0,
          reviewCount: agg._count.id,
        }
      } catch {
        return { ...company, avgRating: 0, reviewCount: 0 }
      }
    })
  )

  const categories = Array.from(
    new Set(allCompanies.map((c) => c.category))
  ).sort()

  const mostReviewed = [...companiesWithScores]
    .filter((c) => c.reviewCount > 0)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 6)

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="bg-[#FDF8F0]">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
            Real reviews.
            <br />
            Real Rwandans.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-zinc-600">
            Every review is verified with a 100 RWF payment. No fake reviews,
            no spam — just honest experiences from real people.
          </p>
          <div className="mx-auto mt-10 max-w-3xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex items-center justify-center gap-8 text-sm text-zinc-500">
            <span className="font-medium text-zinc-900">
              <AnimatedCounter value={totalReviews} /> Reviews
            </span>
            <span className="text-zinc-300">·</span>
            <span className="font-medium text-zinc-900">
              <AnimatedCounter value={totalCompanies} /> Companies
            </span>
            <span className="text-zinc-300">·</span>
            <span className="font-medium text-zinc-900">
              <AnimatedCounter value={uniqueDistricts} /> Districts
            </span>
          </div>
        </div>
      </section>

      {/* Category Browser + Company Grid */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="flex flex-col gap-12 md:flex-row">
          {/* Categories */}
          <aside className="md:w-56 md:shrink-0">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Categories
            </h2>
            <ul className="mt-4 space-y-1">
              <li>
                <Link
                  href="/"
                  className="block py-2 text-sm font-medium text-zinc-900"
                >
                  All
                </Link>
              </li>
              {categories.map((cat) => {
                const count = allCompanies.filter((c) => c.category === cat).length
                return (
                  <li key={cat}>
                    <Link
                      href={`/?category=${encodeURIComponent(cat)}`}
                      className="flex items-center justify-between py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                    >
                      <span>{cat}</span>
                      <span className="text-xs text-zinc-400">{count}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </aside>

          {/* Company Grid */}
          <div className="flex-1">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {companiesWithScores.slice(0, 9).map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/leaderboard">
                <Button variant="outline" className="rounded-full">
                  View all companies
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Most Reviewed */}
      {mostReviewed.length > 0 && (
        <section className="border-t border-zinc-100 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <h2 className="text-3xl font-black tracking-tight text-zinc-900">
              Most Reviewed
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Companies with the most community feedback.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mostReviewed.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Reviews */}
      {latestReviews.length > 0 && (
        <section className="border-t border-zinc-100">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <h2 className="text-3xl font-black tracking-tight text-zinc-900">
              Latest Reviews
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              What people are saying right now.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {latestReviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/company/${review.company?.slug}`}
                  className="block rounded-xl border border-zinc-100 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        {review.company?.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {review.user?.fullName || 'Anonymous'} ·{' '}
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm text-zinc-600">
                    {review.comment}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-zinc-100 bg-[#FDF8F0]">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
          <h2 className="text-3xl font-black tracking-tight text-zinc-900">
            Had an experience worth sharing?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-zinc-600">
            Review any company in Rwanda. Your voice matters — and it only costs
            100 RWF to verify you&apos;re real.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {session ? (
              <Link href="/add-company">
                <Button className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800">
                  Write a Review
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800">
                  Get Started
                </Button>
              </Link>
            )}
            <Link href="/leaderboard">
              <Button variant="outline" className="rounded-full">
                Browse Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
