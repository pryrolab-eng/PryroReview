import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const exists = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    })
    if (exists) {
      return Response.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    const password = await hash(parsed.data.password, 12)

    // Auto-verify on creation — no email verification step
    const user = await prisma.user.create({
      data: {
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        password,
        emailVerified: new Date(),
      },
    })

    return Response.json(
      { message: 'Account created. You can now sign in.', verified: true },
      { status: 201 }
    )
  } catch (err) {
    console.error('[register]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
