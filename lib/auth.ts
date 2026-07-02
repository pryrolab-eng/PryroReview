import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  // On Vercel, cookies must be secure; locally they don't need to be
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Retry once — Neon free tier may be waking from sleep
        let user = null
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            user = await prisma.user.findUnique({
              where: { email: credentials.email },
            })
            break
          } catch (err) {
            if (attempt === 1) throw err
            await new Promise((r) => setTimeout(r, 2000))
          }
        }
        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        // Not verified — return null with a custom error via query param trick:
        // We redirect to /login?error=not_verified using NextAuth's error page
        if (!user.emailVerified) {
          throw new Error('not_verified')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',   // NextAuth sends ?error=<message> to this page on throw
  },
}
