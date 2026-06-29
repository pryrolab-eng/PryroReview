import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'
import prisma from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'
import { sendVerificationEmail } from '@/lib/email'

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
    const user = await prisma.user.create({
      data: {
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        password,
        // emailVerified stays null until they click the link
      },
    })

    // Create a verification token valid for 24 hours
    // Using $executeRaw because prisma client may not have regenerated yet
    const token = randomBytes(32).toString('hex')
    const tokenId = randomBytes(12).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await prisma.$executeRaw`
      INSERT INTO "VerificationToken" (id, token, "userId", "expiresAt", "createdAt")
      VALUES (${tokenId}, ${token}, ${user.id}, ${expiresAt}, NOW())
    `

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verifyUrl = `${appUrl}/api/auth/verify?token=${token}`

    // Fire and forget — don't block response on email
    sendVerificationEmail(user.email, user.fullName, verifyUrl).catch(() => {})

    return Response.json(
      { message: 'Account created. Check your email for a verification link.' },
      { status: 201 }
    )
  } catch (err) {
    console.error('[register]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
