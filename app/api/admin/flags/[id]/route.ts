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
    const body = await req.json()
    const flag = await prisma.flag.update({ where: { id }, data: { dismissed: body.dismissed } })
    return Response.json(flag)
  } catch (err) {
    console.error('[PATCH /api/admin/flags/[id]]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    await prisma.flag.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/flags/[id]]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
