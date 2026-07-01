import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// PATCH /api/reviews/[id] — owner can edit rating, category, comment
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string

    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) {
      return Response.json({ error: 'Review not found' }, { status: 404 })
    }
    if (review.userId !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { rating, category, comment } = body

    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return Response.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }
    if (comment !== undefined && comment.trim().length < 50) {
      return Response.json({ error: 'Comment must be at least 50 characters' }, { status: 400 })
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...(rating !== undefined && { rating }),
        ...(category !== undefined && { category }),
        ...(comment !== undefined && { comment: comment.trim() }),
      },
      include: {
        company: { select: { id: true, name: true, slug: true } },
      },
    })

    return Response.json(updated)
  } catch (err) {
    console.error('[PATCH /api/reviews/[id]]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/reviews/[id] — owner can delete their own review
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string

    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) {
      return Response.json({ error: 'Review not found' }, { status: 404 })
    }
    if (review.userId !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.review.delete({ where: { id } })

    return Response.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/reviews/[id]]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
