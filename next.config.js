/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Moved from experimental.serverComponentsExternalPackages in Next.js 15+
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  // Suppress NextAuth CLIENT_FETCH_ERROR noise in Turbopack dev mode
  // by ensuring the auth API route is always treated as dynamic
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ]
  },
}

module.exports = nextConfig
