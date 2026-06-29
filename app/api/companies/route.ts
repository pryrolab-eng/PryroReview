import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { companySchema } from '@/lib/validations'
import { generateSlug } from '@/lib/slug'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const district = searchParams.get('district') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const take = 12
    const skip = (page - 1) * take

    const where: any = {}
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { district: { contains: query, mode: 'insensitive' } },
      ]
    }
    if (category) where.category = { contains: category, mode: 'insensitive' }
    if (district) where.district = { contains: district, mode: 'insensitive' }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { reviews: true } },
        },
      }),
      prisma.company.count({ where }),
    ])

    // Calculate average rating for each company
    const companiesWithRating = await Promise.all(
      companies.map(async (company) => {
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
      })
    )

    return Response.json({
      companies: companiesWithRating,
      total,
      page,
      totalPages: Math.ceil(total / take),
    })
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

    const body = await req.json()
    const parsed = companySchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, category, district, website, phone, description } = parsed.data

    // Check for duplicate
    const existing = await prisma.company.findFirst({
      where: {
        name: { contains: name, mode: 'insensitive' },
        district,
      },
    })
    if (existing) {
      return Response.json(
        { error: `A company with this name already exists in ${district}` },
        { status: 409 }
      )
    }

    const slug = await generateSlug(name)
    const userId = (session.user as any).id

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        category,
        district,
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
