import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = (searchParams.get('type') || 'best') as 'best' | 'worst'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const take = 25
    const skip = (page - 1) * take

    // Include ALL companies (even with no reviews), sorted by avg rating.
    // Companies with no reviews get avg_rating = 0 and review_count = 0.
    // Best: highest avg first (ties broken by review count), no-review companies at bottom.
    // Worst: lowest avg first among companies that HAVE reviews, then no-review companies.
    const bestQuery = prisma.$queryRaw<
      Array<{
        id: string
        name: string
        slug: string
        category: string
        district: string
        verified: boolean
        website: string | null
        avg_rating: number
        review_count: bigint
      }>
    >`
      SELECT
        c.id, c.name, c.slug, c.category, c.district, c.verified, c.website,
        COALESCE(AVG(NULLIF(r.rating, 0)), 0)::float AS avg_rating,
        COUNT(r.id) AS review_count
      FROM "Company" c
      LEFT JOIN "Review" r ON r."companyId" = c.id
      GROUP BY c.id, c.name, c.slug, c.category, c.district, c.verified, c.website
      ORDER BY
        CASE WHEN COUNT(r.id) = 0 THEN 1 ELSE 0 END ASC,
        avg_rating DESC,
        COUNT(r.id) DESC
    `

    const worstQuery = prisma.$queryRaw<
      Array<{
        id: string
        name: string
        slug: string
        category: string
        district: string
        verified: boolean
        website: string | null
        avg_rating: number
        review_count: bigint
      }>
    >`
      SELECT
        c.id, c.name, c.slug, c.category, c.district, c.verified, c.website,
        COALESCE(AVG(NULLIF(r.rating, 0)), 0)::float AS avg_rating,
        COUNT(r.id) AS review_count
      FROM "Company" c
      LEFT JOIN "Review" r ON r."companyId" = c.id
      GROUP BY c.id, c.name, c.slug, c.category, c.district, c.verified, c.website
      ORDER BY
        CASE WHEN COUNT(r.id) = 0 THEN 1 ELSE 0 END ASC,
        avg_rating ASC,
        COUNT(r.id) DESC
    `

    const all = await (type === 'best' ? bestQuery : worstQuery)

    const total = all.length
    const paginated = all.slice(skip, skip + take)

    const ranked = paginated.map((company, index) => ({
      ...company,
      review_count: Number(company.review_count),
      avg_rating: Number(Number(company.avg_rating).toFixed(1)),
      rank: skip + index + 1,
    }))

    return Response.json(
      { companies: ranked, total, page, totalPages: Math.ceil(total / take) },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    )
  } catch (err) {
    console.error('[GET /api/leaderboard]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
