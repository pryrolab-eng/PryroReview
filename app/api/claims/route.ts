import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { claimSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    const body = await req.json()
    const parsed = claimSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { companyId, fullName, businessEmail, regNumber } = parsed.data

    // Check for existing pending claim
    const existing = await prisma.claim.findFirst({
      where: { companyId, userId, status: 'PENDING' },
    })
    if (existing) {
      return Response.json(
        { error: 'You already have a pending claim for this company' },
        { status: 409 }
      )
    }

    const claim = await prisma.claim.create({
      data: {
        companyId,
        userId,
        fullName,
        businessEmail,
        regNumber: regNumber || null,
      },
    })

    return Response.json(claim, { status: 201 })
  } catch (err) {
    console.error('[POST /api/claims]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
