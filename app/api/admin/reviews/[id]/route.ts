import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendReviewDeletedEmail } from '@/lib/email'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, fullName: true } },
        company: { select: { name: true } },
      },
    })

    await prisma.review.delete({ where: { id } })

    if (review) {
      sendReviewDeletedEmail(
        review.user.email,
        review.user.fullName,
        review.company.name
      ).catch(() => {})
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/reviews/[id]]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
