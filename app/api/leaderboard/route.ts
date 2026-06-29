import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = (searchParams.get('type') || 'best') as 'best' | 'worst'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const take = 10
    const skip = (page - 1) * take

    // Get all companies that have at least one review, with avg rating
    // Run best and worst as separate fixed queries
    const bestQuery = prisma.$queryRaw<
      Array<{
        id: string
        name: string
        slug: string
        category: string
        district: string
        verified: boolean
        avg_rating: number
        review_count: bigint
      }>
    >`
      SELECT
        c.id, c.name, c.slug, c.category, c.district, c.verified,
        AVG(r.rating)::float AS avg_rating,
        COUNT(r.id) AS review_count
      FROM "Company" c
      INNER JOIN "Review" r ON r."companyId" = c.id
      GROUP BY c.id, c.name, c.slug, c.category, c.district, c.verified
      ORDER BY avg_rating DESC, review_count DESC
    `

    const worstQuery = prisma.$queryRaw<
      Array<{
        id: string
        name: string
        slug: string
        category: string
        district: string
        verified: boolean
        avg_rating: number
        review_count: bigint
      }>
    >`
      SELECT
        c.id, c.name, c.slug, c.category, c.district, c.verified,
        AVG(r.rating)::float AS avg_rating,
        COUNT(r.id) AS review_count
      FROM "Company" c
      INNER JOIN "Review" r ON r."companyId" = c.id
      GROUP BY c.id, c.name, c.slug, c.category, c.district, c.verified
      ORDER BY avg_rating ASC, review_count DESC
    `

    const companiesWithRatings = await (type === 'best' ? bestQuery : worstQuery)

    const total = companiesWithRatings.length
    const paginated = companiesWithRatings.slice(skip, skip + take)

    const ranked = paginated.map((company, index) => ({
      ...company,
      review_count: Number(company.review_count),
      avg_rating: Number(company.avg_rating.toFixed(1)),
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
