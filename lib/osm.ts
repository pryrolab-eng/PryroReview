/**
 * OpenStreetMap Overpass API helper
 * Completely free, no API key required.
 * Pulls real businesses tagged in Rwanda from OSM data.
 */

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

export interface OsmBusiness {
  osmId: string
  name: string
  category: string
  district: string
  website: string | null
  phone: string | null
  description: string | null
  lat: number | null
  lon: number | null
}

/** Map OSM amenity/shop/office tags → your platform categories */
function mapOsmCategory(tags: Record<string, string>): string {
  const amenity = tags.amenity || ''
  const shop = tags.shop || ''
  const office = tags.office || ''
  const tourism = tags.tourism || ''
  const healthcare = tags.healthcare || tags['amenity:hospital'] || ''

  if (['bank', 'atm', 'bureau_de_change', 'money_transfer'].includes(amenity) || office === 'financial')
    return 'Banking & Finance'
  if (['hospital', 'clinic', 'pharmacy', 'doctors'].includes(amenity) || healthcare)
    return 'Healthcare'
  if (['university', 'college', 'school', 'kindergarten'].includes(amenity) || office === 'educational_institution')
    return 'Education'
  if (['hotel', 'hostel', 'guest_house', 'motel'].includes(tourism) || amenity === 'hotel')
    return 'Hospitality & Tourism'
  if (['restaurant', 'cafe', 'fast_food', 'bar', 'pub', 'food_court'].includes(amenity))
    return 'Hospitality & Tourism'
  if (['supermarket', 'mall', 'department_store', 'convenience', 'clothes', 'electronics'].includes(shop))
    return 'Retail & Shopping'
  if (['government', 'government_office', 'public_building'].includes(office) || amenity === 'townhall')
    return 'Government Services'
  if (['fuel', 'charging_station'].includes(amenity) || office === 'energy')
    return 'Energy & Utilities'
  if (tags.telecom || tags.communication || office === 'telecom')
    return 'Telecommunications'
  if (amenity === 'bus_station' || amenity === 'taxi' || tags.aeroway)
    return 'Airlines & Transport'
  if (office === 'ngo' || office === 'charity' || tags.operator_type === 'ngo')
    return 'NGOs & Development'

  return 'Other'
}

/** Rough district lookup based on OSM addr:city / addr:district tags or bounding box */
function mapOsmDistrict(tags: Record<string, string>): string {
  const raw = (
    tags['addr:district'] ||
    tags['addr:city'] ||
    tags['addr:province'] ||
    tags['is_in:district'] ||
    ''
  ).toLowerCase()

  if (raw.includes('kigali') || raw.includes('nyarugenge') || raw.includes('kicukiro') || raw.includes('gasabo'))
    return 'Kigali'
  if (raw.includes('northern') || raw.includes('nord') || raw.includes('musanze') || raw.includes('rulindo') || raw.includes('gicumbi'))
    return 'Northern Province'
  if (raw.includes('southern') || raw.includes('sud') || raw.includes('huye') || raw.includes('nyanza') || raw.includes('muhanga'))
    return 'Southern Province'
  if (raw.includes('eastern') || raw.includes('est') || raw.includes('rwamagana') || raw.includes('kayonza') || raw.includes('bugesera'))
    return 'Eastern Province'
  if (raw.includes('western') || raw.includes('ouest') || raw.includes('rubavu') || raw.includes('rusizi') || raw.includes('nyamasheke'))
    return 'Western Province'

  return 'Kigali' // default — most OSM Rwanda data is Kigali
}

/**
 * Query OSM for named businesses in Rwanda.
 * Uses a broad Overpass query scoped to the Rwanda bounding box.
 * Returns up to `limit` results.
 */
export async function fetchOsmBusinesses(limit = 500): Promise<OsmBusiness[]> {
  // Rwanda bounding box: south=-2.84, west=28.85, north=-1.05, east=30.90
  const query = `
[out:json][timeout:60];
(
  node["name"]["amenity"](area["ISO3166-1"="RW"]);
  node["name"]["shop"](area["ISO3166-1"="RW"]);
  node["name"]["office"](area["ISO3166-1"="RW"]);
  node["name"]["tourism"]["tourism"!="artwork"]["tourism"!="information"](area["ISO3166-1"="RW"]);
  way["name"]["amenity"](area["ISO3166-1"="RW"]);
  way["name"]["shop"](area["ISO3166-1"="RW"]);
  way["name"]["office"](area["ISO3166-1"="RW"]);
)->.all;
.all out tags center ${limit};
  `.trim()

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(65000),
  })

  if (!res.ok) {
    throw new Error(`Overpass API error: ${res.status}`)
  }

  const json = await res.json()
  const elements: any[] = json.elements || []

  const seen = new Set<string>()
  const results: OsmBusiness[] = []

  for (const el of elements) {
    const tags: Record<string, string> = el.tags || {}
    const name: string = (tags.name || '').trim()

    if (!name || seen.has(name.toLowerCase())) continue
    seen.add(name.toLowerCase())

    const lat = el.lat ?? el.center?.lat ?? null
    const lon = el.lon ?? el.center?.lon ?? null

    results.push({
      osmId: `osm-${el.type}-${el.id}`,
      name,
      category: mapOsmCategory(tags),
      district: mapOsmDistrict(tags),
      website: tags.website || tags['contact:website'] || null,
      phone: tags.phone || tags['contact:phone'] || null,
      description: tags.description || null,
      lat,
      lon,
    })
  }

  return results
}

/**
 * Search OSM for businesses in Rwanda matching a text query.
 * Used for live search suggestions when a company isn't in the local DB yet.
 */
export async function searchOsmBusinesses(query: string, limit = 8): Promise<OsmBusiness[]> {
  const escaped = query.replace(/[^\w\s]/g, '').trim()
  if (!escaped) return []

  const overpassQuery = `
[out:json][timeout:20];
area["ISO3166-1"="RW"]->.rw;
(
  node["name"~"${escaped}",i](area.rw);
  way["name"~"${escaped}",i](area.rw);
)->.all;
.all out tags center ${limit * 3};
  `.trim()

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(overpassQuery)}`,
      signal: AbortSignal.timeout(22000),
    })

    if (!res.ok) return []

    const json = await res.json()
    const elements: any[] = json.elements || []

    const seen = new Set<string>()
    const results: OsmBusiness[] = []

    for (const el of elements) {
      const tags: Record<string, string> = el.tags || {}
      const name: string = (tags.name || '').trim()
      if (!name || seen.has(name.toLowerCase())) continue
      // only include things that look like businesses
      if (!tags.amenity && !tags.shop && !tags.office && !tags.tourism && !tags.healthcare) continue
      seen.add(name.toLowerCase())

      results.push({
        osmId: `osm-${el.type}-${el.id}`,
        name,
        category: mapOsmCategory(tags),
        district: mapOsmDistrict(tags),
        website: tags.website || tags['contact:website'] || null,
        phone: tags.phone || tags['contact:phone'] || null,
        description: tags.description || null,
        lat: el.lat ?? el.center?.lat ?? null,
        lon: el.lon ?? el.center?.lon ?? null,
      })

      if (results.length >= limit) break
    }

    return results
  } catch {
    return []
  }
}
