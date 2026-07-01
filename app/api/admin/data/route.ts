import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma, { withRetry } from '@/lib/prisma'

async function fetchData(tab: string, skip: number, take: number) {
  switch (tab) {
    case 'companies':
      return Promise.all([
        prisma.company.findMany({ orderBy: { createdAt: 'desc' }, skip, take }),
        prisma.company.count(),
      ])

    case 'reviews':
      return Promise.all([
        prisma.review.findMany({
          orderBy: { createdAt: 'desc' }, skip, take,
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            company: { select: { id: true, name: true, slug: true } },
          },
        }),
        prisma.review.count(),
      ])

    case 'users':
      return Promise.all([
        prisma.user.findMany({
          orderBy: { createdAt: 'desc' }, skip, take,
          select: { id: true, fullName: true, email: true, role: true, createdAt: true },
        }),
        prisma.user.count(),
      ])

    case 'payments':
      return Promise.all([
        prisma.payment.findMany({
          orderBy: { createdAt: 'desc' }, skip, take,
          include: { user: { select: { id: true, fullName: true } } },
        }),
        prisma.payment.count(),
      ])

    case 'flags':
      return Promise.all([
        prisma.flag.findMany({
          orderBy: { createdAt: 'desc' }, skip, take,
          include: {
            user: { select: { id: true, fullName: true } },
            review: {
              include: { company: { select: { id: true, name: true, slug: true } } },
            },
          },
        }),
        prisma.flag.count(),
      ])

    default:
      return [[], 0] as [any[], number]
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const tab  = searchParams.get('tab') || 'companies'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const take = 10
    const skip = (page - 1) * take

    let data: any[] = []
    let total = 0

    ;[data, total] = await withRetry(() => fetchData(tab, skip, take))

    return Response.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / take),
    })
  } catch (err) {
    console.error('[GET /api/admin/data]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
