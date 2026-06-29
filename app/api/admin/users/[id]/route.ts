import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const currentUserId = (session.user as any).id
    if (id === currentUserId) {
      return Response.json({ error: 'Cannot change your own role' }, { status: 400 })
    }

    const body = await req.json()
    const user = await prisma.user.update({
      where: { id },
      data: { role: body.role },
      select: { id: true, email: true, fullName: true, role: true },
    })

    return Response.json(user)
  } catch (err) {
    console.error('[PATCH /api/admin/users/[id]]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
