import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { mtnPaymentSchema } from '@/lib/validations'
import { requestMtnPayment } from '@/lib/mtn'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    const body = await req.json()
    const parsed = mtnPaymentSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { phone, companyId, companyName } = parsed.data
    const referenceId = uuidv4()
    const externalId = uuidv4()

    // Create payment record with status always 'pending'
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: 100,
        method: 'MTN',
        status: 'pending',
        phoneNumber: phone,
        referenceId,
        companyId,
      },
    })

    // In sandbox mode, skip real API call unless env is production
    if (process.env.NEXT_PUBLIC_PAYMENT_MODE !== 'sandbox') {
      const initiated = await requestMtnPayment(
        phone,
        referenceId,
        externalId,
        companyName
      )
      if (!initiated) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'failed' },
        })
        return Response.json(
          { error: 'Failed to initiate payment' },
          { status: 502 }
        )
      }
    }

    return Response.json({ paymentId: payment.id, referenceId }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/payments/mtn/request]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
