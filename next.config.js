/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Moved from experimental.serverComponentsExternalPackages in Next.js 15+
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
}

module.exports = nextConfig
