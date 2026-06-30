/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // Required for Prisma + bcryptjs on Vercel serverless
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
}

module.exports = nextConfig
