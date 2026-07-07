import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Required for Next.js 16 to handle NextAuth correctly
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
