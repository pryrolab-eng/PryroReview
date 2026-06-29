import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    const role = (session.user as any).role as string

    const { response } = await req.json()
    if (!response || response.trim().length < 5) {
      return Response.json({ error: 'Response too short' }, { status: 400 })
    }

    // Verify permission: admin OR approved claim holder for this company
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      select: { companyId: true },
    })
    if (!review) {
      return Response.json({ error: 'Review not found' }, { status: 404 })
    }

    if (role !== 'ADMIN') {
      const claim = await prisma.claim.findFirst({
        where: { companyId: review.companyId, userId, status: 'APPROVED' },
      })
      if (!claim) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const updated = await prisma.review.update({
      where: { id: params.id },
      data: { response: response.trim() },
    })

    return Response.json(updated)
  } catch (err) {
    console.error('[POST /api/reviews/[id]/respond]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
