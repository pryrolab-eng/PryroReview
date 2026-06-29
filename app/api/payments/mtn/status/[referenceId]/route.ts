import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { checkMtnPaymentStatus } from '@/lib/mtn'

export async function GET(
  req: Request,
  { params }: { params: { referenceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { referenceId } = params

    // Sandbox mode: auto-confirm after first poll
    if (process.env.NEXT_PUBLIC_PAYMENT_MODE === 'sandbox') {
      const payment = await prisma.payment.findFirst({
        where: { referenceId },
      })
      if (!payment) {
        return Response.json({ error: 'Payment not found' }, { status: 404 })
      }
      if (payment.status === 'pending') {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'confirmed' },
        })
        return Response.json({ status: 'confirmed' })
      }
      return Response.json({ status: payment.status })
    }

    // Production: check real MTN status
    const mtnStatus = await checkMtnPaymentStatus(referenceId)

    if (mtnStatus === 'SUCCESSFUL') {
      await prisma.payment.updateMany({
        where: { referenceId },
        data: { status: 'confirmed' },
      })
      return Response.json({ status: 'confirmed' })
    }

    if (mtnStatus === 'FAILED') {
      await prisma.payment.updateMany({
        where: { referenceId },
        data: { status: 'failed' },
      })
      return Response.json({ status: 'failed' })
    }

    return Response.json({ status: 'pending' })
  } catch (err) {
    console.error('[GET /api/payments/mtn/status/[referenceId]]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
