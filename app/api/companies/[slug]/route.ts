import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, fullName: true } },
          },
        },
      },
    })

    if (!company) {
      return Response.json({ error: 'Company not found' }, { status: 404 })
    }

    const totalReviews = company.reviews.length
    const avgRating =
      totalReviews > 0
        ? Number(
            (
              company.reviews.reduce((sum, r) => sum + r.rating, 0) /
              totalReviews
            ).toFixed(1)
          )
        : 0

    // Rating breakdown (1★–5★)
    const ratingBreakdown = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: company.reviews.filter((r) => r.rating === star).length,
    }))

    // Category scores
    const categoryMap: Record<string, { sum: number; count: number }> = {}
    for (const review of company.reviews) {
      if (!categoryMap[review.category]) {
        categoryMap[review.category] = { sum: 0, count: 0 }
      }
      categoryMap[review.category].sum += review.rating
      categoryMap[review.category].count++
    }
    const categoryScores = Object.entries(categoryMap).map(([cat, data]) => ({
      category: cat,
      avgRating: Number((data.sum / data.count).toFixed(1)),
      count: data.count,
    }))

    return Response.json({
      ...company,
      avgRating,
      totalReviews,
      ratingBreakdown,
      categoryScores,
    }, { headers: { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60' } })  } catch (err) {
    console.error('[GET /api/companies/[slug]]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
