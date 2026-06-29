import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { flagSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    const body = await req.json()
    const parsed = flagSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { reviewId, reason } = parsed.data

    // Check for duplicate flag
    const existing = await prisma.flag.findFirst({
      where: { reviewId, userId },
    })
    if (existing) {
      return Response.json(
        { error: 'You have already flagged this review' },
        { status: 409 }
      )
    }

    const flag = await prisma.flag.create({
      data: { reviewId, userId, reason },
    })

    return Response.json(flag, { status: 201 })
  } catch (err) {
    console.error('[POST /api/flags]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
