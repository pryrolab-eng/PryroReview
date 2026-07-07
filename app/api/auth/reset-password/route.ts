import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Hash the incoming token to compare against stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Reset link is invalid or has expired' },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({ message: 'Password reset successful' })
  } catch (err) {
    console.error('[reset-password]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
