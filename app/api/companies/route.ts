import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma, { withRetry } from '@/lib/prisma'
import { companySchema } from '@/lib/validations'
import { generateSlug } from '@/lib/slug'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query    = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const district = searchParams.get('district') || ''
    const page     = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const take     = 12
    const skip     = (page - 1) * take

    // Build WHERE clause fragments
    const conditions: string[] = []
    const args: unknown[] = []
    let idx = 1

    if (query) {
      conditions.push(`(c.name ILIKE $${idx} OR c.category ILIKE $${idx} OR c.district ILIKE $${idx})`)
      args.push(`%${query}%`)
      idx++
    }
    if (category) { conditions.push(`c.category ILIKE $${idx}`); args.push(`%${category}%`); idx++ }
    if (district) { conditions.push(`c.district ILIKE $${idx}`); args.push(`%${district}%`); idx++ }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    // Single query: companies + avg rating + review count in one shot
    type Row = {
      id: string; name: string; slug: string; category: string; district: string
      website: string | null; phone: string | null; description: string | null
      verified: boolean; verified_source: string | null; created_at: Date
      avg_rating: number | null; review_count: bigint; total: bigint
    }

    const rows = await withRetry(() =>
      prisma.$queryRawUnsafe<Row[]>(`
        SELECT
          c.id, c.name, c.slug, c.category, c.district,
          c.website, c.phone, c.description, c.verified,
          c."verifiedSource" AS verified_source, c."createdAt" AS created_at,
          AVG(r.rating)::float          AS avg_rating,
          COUNT(r.id)                   AS review_count,
          COUNT(*) OVER()               AS total
        FROM "Company" c
        LEFT JOIN "Review" r ON r."companyId" = c.id
        ${where}
        GROUP BY c.id
        ORDER BY c."createdAt" DESC
        LIMIT ${take} OFFSET ${skip}
      `, ...args)
    )

    const total = rows.length > 0 ? Number(rows[0].total) : 0

    const companies = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      category: r.category,
      district: r.district,
      website: r.website,
      phone: r.phone,
      description: r.description,
      verified: r.verified,
      verifiedSource: r.verified_source,
      createdAt: r.created_at,
      avgRating: r.avg_rating ? Number(r.avg_rating.toFixed(1)) : 0,
      reviewCount: Number(r.review_count),
    }))

    return Response.json(
      { companies, total, page, totalPages: Math.ceil(total / take) },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    )
  } catch (err) {
    console.error('[GET /api/companies]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body   = await req.json()
    const parsed = companySchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { name, category, district, website, phone, description } = parsed.data

    const existing = await prisma.company.findFirst({
      where: { name: { contains: name, mode: 'insensitive' }, district },
    })
    if (existing) {
      return Response.json(
        { error: `A company with this name already exists in ${district}` },
        { status: 409 }
      )
    }

    const slug   = await generateSlug(name)
    const userId = (session.user as any).id

    const company = await prisma.company.create({
      data: {
        name, slug, category, district,
        website: website || null,
        phone: phone || null,
        description: description || null,
        verified: false,
        addedByUserId: userId,
      },
    })

    return Response.json(company, { status: 201 })
  } catch (err) {
    console.error('[POST /api/companies]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
