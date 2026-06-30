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
    const emailEnabled = !!process.env.RESEND_API_KEY

    // If no email service configured, auto-verify immediately so users can log in
    const user = await prisma.user.create({
      data: {
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        password,
        emailVerified: emailEnabled ? null : new Date(),
      },
    })

    if (emailEnabled) {
      // Create a verification token valid for 24 hours
      const token = randomBytes(32).toString('hex')
      const tokenId = randomBytes(12).toString('hex')
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await prisma.$executeRaw`
        INSERT INTO "VerificationToken" (id, token, "userId", "expiresAt", "createdAt")
        VALUES (${tokenId}, ${token}, ${user.id}, ${expiresAt}, NOW())
      `

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const verifyUrl = `${appUrl}/api/auth/verify?token=${token}`

      // Fire and forget
      sendVerificationEmail(user.email, user.fullName, verifyUrl).catch(() => {})

      return Response.json(
        { message: 'Account created. Check your email for a verification link.' },
        { status: 201 }
      )
    }

    // No email configured — account is ready, sign in directly
    return Response.json(
      { message: 'Account created. You can now sign in.', verified: true },
      { status: 201 }
    )
  } catch (err) {
    console.error('[register]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
