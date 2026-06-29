import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = (session.user as any).role as string
    if (role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { response } = await req.json()
    if (!response || response.trim().length < 5) {
      return Response.json({ error: 'Response too short' }, { status: 400 })
    }

    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) {
      return Response.json({ error: 'Review not found' }, { status: 404 })
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { response: response.trim() },
    })

    return Response.json(updated)
  } catch (err) {
    console.error('[POST /api/reviews/[id]/respond]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
