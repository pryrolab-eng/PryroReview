import { searchOsmBusinesses } from '@/lib/osm'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''

  if (query.trim().length < 2) {
    return Response.json({ results: [] })
  }

  try {
    const results = await searchOsmBusinesses(query.trim(), 6)
    return Response.json({ results })
  } catch (err) {
    console.error('[GET /api/osm/search]', err)
    return Response.json({ results: [] })
  }
}
