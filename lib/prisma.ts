import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Retry a Prisma call up to `attempts` times with a delay between each.
 * Handles Neon free-tier cold-start network errors (P1001, ECONNRESET, etc.)
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 2500
): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err: any) {
      lastErr = err
      const isRetryable =
        err?.code === 'P1001' ||          // Prisma "Can't reach database server"
        err?.message?.includes('network') ||
        err?.message?.includes('ECONNRESET') ||
        err?.message?.includes('ENOTFOUND') ||
        err?.message?.includes('Connect timeout')
      if (!isRetryable || i === attempts - 1) throw err
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
  throw lastErr
}

export default prisma
