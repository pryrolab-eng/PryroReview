'use client'

import { SessionProvider, useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import { ReactNode } from 'react'

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider basePath="/api/auth">{children}</SessionProvider>
}

export function useAuth() {
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  const user = session?.user
    ? {
        id: (session.user as any).id as string,
        email: session.user.email!,
        fullName: session.user.name!,
        role: (session.user as any).role as string,
      }
    : null

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/' })
  }

  return { user, loading, signOut, session }
}
