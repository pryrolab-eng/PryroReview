import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  },
  {
    pages: {
      signIn: '/login',
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const protectedRoutes = ['/my-reviews', '/admin']
        const isProtected = protectedRoutes.some((r) =>
          req.nextUrl.pathname.startsWith(r)
        )
        if (isProtected) return !!token
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/my-reviews/:path*'],
}
