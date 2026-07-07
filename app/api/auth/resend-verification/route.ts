import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 })
    }

    // Delete any existing tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    })

    // Create new token
    const token = crypto.randomBytes(32).toString('hex')
    await prisma.verificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verifyUrl = `${appUrl}/api/auth/verify?token=${token}`

    await sendVerificationEmail(user.email, user.fullName, verifyUrl)

    return NextResponse.json({ message: 'Verification email sent' }, { status: 200 })
  } catch (err) {
    console.error('[resend-verification]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
