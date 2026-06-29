import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { verifiedRwandanBusinesses } from '@/lib/real-businesses'
import { fetchOsmBusinesses } from '@/lib/osm'
import { generateSlug } from '@/lib/slug'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const source = searchParams.get('source') || 'all' // 'static' | 'osm' | 'all'

    let businesses: { name: string; category: string; district: string; website?: string | null; phone?: string | null; description?: string | null; verified: boolean; verifiedSource: string }[] = []

    // Always include the curated static list
    if (source === 'static' || source === 'all') {
      businesses = [...verifiedRwandanBusinesses]
    }

    // Try OSM if requested (may fail on network issues)
    if (source === 'osm' || source === 'all') {
      try {
        const osmLimit = parseInt(searchParams.get('limit') || '300')
        const osmBizs = await fetchOsmBusinesses(osmLimit)
        const asMapped = osmBizs.map((b) => ({
          name: b.name,
          category: b.category,
          district: b.district,
          website: b.website,
          phone: b.phone,
          description: b.description,
          verified: true,
          verifiedSource: 'openstreetmap.org',
        }))
        businesses = [...businesses, ...asMapped]
      } catch (osmErr) {
        console.warn('[import] OSM fetch failed, using static only:', osmErr)
      }
    }

    let imported = 0
    let skipped = 0
    let errors = 0

    for (const biz of businesses) {
      try {
        const exists = await prisma.company.findFirst({
          where: { name: { equals: biz.name, mode: 'insensitive' } },
        })
        if (exists) { skipped++; continue }

        const slug = await generateSlug(biz.name)
        await prisma.company.create({
          data: {
            name: biz.name,
            slug,
            category: biz.category,
            district: biz.district,
            website: biz.website || null,
            phone: biz.phone || null,
            description: biz.description || null,
            verified: biz.verified,
            verifiedSource: biz.verifiedSource,
          },
        })
        imported++
      } catch (e) {
        console.error(`Failed to import ${biz.name}:`, e)
        errors++
      }
    }

    await prisma.syncLog.create({
      data: { source: `import:${source}`, imported, skipped, errors },
    })

    return Response.json({ imported, skipped, errors, total: businesses.length })
  } catch (err) {
    console.error('[POST /api/admin/import-businesses]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
