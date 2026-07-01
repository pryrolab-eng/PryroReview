import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma, { withRetry } from '@/lib/prisma'
import { reviewSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // userId ALWAYS from session — never from request body
    const userId = (session.user as any).id as string

    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { companyId, paymentId, rating, category, comment } = parsed.data

    // Verify payment belongs to this user and is confirmed
    const payment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
        userId,
        status: 'confirmed',
      },
    })
    if (!payment) {
      return Response.json(
        { error: 'Payment not found or not confirmed' },
        { status: 400 }
      )
    }

    // Enforce one review per user per company
    const duplicate = await prisma.review.findFirst({
      where: { companyId, userId },
    })
    if (duplicate) {
      return Response.json(
        { error: 'You have already reviewed this company' },
        { status: 409 }
      )
    }

    const review = await prisma.review.create({
      data: {
        companyId,
        userId,
        paymentId,
        rating,
        category,
        comment,
      },
      include: {
        user: { select: { id: true, fullName: true } },
        company: { select: { id: true, name: true, slug: true } },
      },
    })

    return Response.json(review, { status: 201 })
  } catch (err) {
    console.error('[POST /api/reviews]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string

    const reviews = await withRetry(() =>
      prisma.review.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, name: true, slug: true } },
        },
      })
    )

    return Response.json(reviews)
  } catch (err) {
    console.error('[GET /api/reviews]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
