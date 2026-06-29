/**
 * One-time script: mark all existing users as email-verified
 * so they can log in (they registered before email verification was added).
 * Run with: node scripts/verify-existing-users.mjs
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const result = await prisma.user.updateMany({
  where: { emailVerified: null },
  data: { emailVerified: new Date() },
})

console.log(`✓ Marked ${result.count} existing user(s) as verified`)
await prisma.$disconnect()
