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
 * Retry a Prisma call up to `attempts` times with a short delay.
 * Handles Neon free-tier cold-start: P1001, network errors, ECONNRESET, etc.
 * Reduced to 2 attempts × 1.5s to stay within the 10s client timeout.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 2,
  delayMs = 1500
): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err: any) {
      lastErr = err
      const isRetryable =
        err?.code === 'P1001' ||
        err?.code === 'P1002' ||
        err?.message?.includes('network') ||
        err?.message?.includes('ECONNRESET') ||
        err?.message?.includes('ENOTFOUND') ||
        err?.message?.includes('Connect timeout') ||
        err?.message?.includes('timed out')
      if (!isRetryable || i === attempts - 1) throw err
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
  throw lastErr
}

export default prisma
