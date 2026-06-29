import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendClaimApprovedEmail, sendClaimRejectedEmail } from '@/lib/email'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const status = body.status as 'APPROVED' | 'REJECTED'

    const claim = await prisma.claim.update({
      where: { id: params.id },
      data: { status },
      include: {
        user: { select: { email: true, fullName: true } },
        company: { select: { name: true } },
      },
    })

    if (status === 'APPROVED') {
      sendClaimApprovedEmail(
        claim.user.email,
        claim.user.fullName,
        claim.company.name
      ).catch(() => {})
    } else if (status === 'REJECTED') {
      sendClaimRejectedEmail(
        claim.user.email,
        claim.user.fullName,
        claim.company.name
      ).catch(() => {})
    }

    return Response.json(claim)
  } catch (err) {
    console.error('[PATCH /api/admin/claims/[id]]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
