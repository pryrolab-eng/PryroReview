import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!token) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_token`)
  }

  try {
    // Use raw SQL since Prisma client may not have regenerated yet
    const records = await prisma.$queryRaw<
      { id: string; userId: string; expiresAt: Date; usedAt: Date | null }[]
    >`
      SELECT id, "userId", "expiresAt", "usedAt"
      FROM "VerificationToken"
      WHERE token = ${token}
      LIMIT 1
    `

    if (!records || records.length === 0) {
      return NextResponse.redirect(`${appUrl}/login?error=invalid_token`)
    }

    const record = records[0]

    if (record.usedAt) {
      return NextResponse.redirect(`${appUrl}/login?error=token_used`)
    }

    if (new Date(record.expiresAt) < new Date()) {
      return NextResponse.redirect(`${appUrl}/login?error=token_expired`)
    }

    // Mark token as used and verify the user
    await prisma.$executeRaw`
      UPDATE "VerificationToken" SET "usedAt" = NOW() WHERE id = ${record.id}
    `
    await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    })

    return NextResponse.redirect(`${appUrl}/login?verified=true`)
  } catch (err) {
    console.error('[verify]', err)
    return NextResponse.redirect(`${appUrl}/login?error=server_error`)
  }
}
