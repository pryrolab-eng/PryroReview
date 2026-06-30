'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, MapPin, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  id: string
  name: string
  slug: string
  category: string
  district: string
  avgRating: number
  reviewCount: number
}

interface OsmResult {
  osmId: string
  name: string
  category: string
  district: string
  website: string | null
}

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState('')
  const [dbResults, setDbResults] = useState<SearchResult[]>([])
  const [osmResults, setOsmResults] = useState<OsmResult[]>([])
  const [open, setOpen] = useState(false)
  const [loadingDb, setLoadingDb] = useState(false)
  const [loadingOsm, setLoadingOsm] = useState(false)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < 1) {
      setDbResults([])
      setOsmResults([])
      setOpen(false)
      return
    }

    setOpen(true)

    // Search local DB — fast
    const dbTimer = setTimeout(async () => {
      setLoadingDb(true)
      try {
        const res = await fetch(`/api/companies?q=${encodeURIComponent(query)}&page=1`)
        if (res.ok) {
          const data = await res.json()
          setDbResults(data.companies.slice(0, 6))
        }
      } finally {
        setLoadingDb(false)
      }
    }, 200)

    // Search OpenStreetMap — slightly delayed to avoid hammering
    const osmTimer = setTimeout(async () => {
      setLoadingOsm(true)
      try {
        const res = await fetch(`/api/osm/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setOsmResults(data.results || [])
        }
      } finally {
        setLoadingOsm(false)
      }
    }, 600)

    return () => {
      clearTimeout(dbTimer)
      clearTimeout(osmTimer)
    }
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (slug: string) => {
    setOpen(false)
    setQuery('')
    setDbResults([])
    setOsmResults([])
    router.push(`/company/${slug}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (dbResults.length > 0) {
      handleSelect(dbResults[0].slug)
    }
  }

  // OSM results not already in DB
  const newOsmResults = osmResults.filter(
    (osm) => !dbResults.some(
      (db) => db.name.toLowerCase() === osm.name.toLowerCase()
    )
  )

  const hasDbResults = dbResults.length > 0
  const hasOsmResults = newOsmResults.length > 0
  const isLoading = loadingDb || loadingOsm
  const showNotFound = !isLoading && !hasDbResults && !hasOsmResults && query.trim().length >= 2

  return (
    <div ref={containerRef} className={`relative w-full ${className ?? ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 sm:left-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => (dbResults.length > 0 || osmResults.length > 0) && setOpen(true)}
            placeholder="Search for a company — e.g. MTN, Bank of Kigali..."
            className="h-12 w-full rounded-full border border-zinc-200 bg-white pl-12 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none sm:h-14 sm:pl-14 sm:text-base"
          />
          {isLoading && (
            <Loader2 className="absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400" />
          )}
        </div>
      </form>

      {open && query.trim().length >= 1 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[60vh] overflow-y-auto overflow-x-hidden rounded-xl border border-zinc-100 bg-white shadow-lg">

          {/* Local DB results */}
          {hasDbResults && (
            <>
              <div className="px-4 pt-3 pb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  On Pryro Review
                </span>
              </div>
              <ul>
                {dbResults.map((company) => (
                  <li key={company.id}>
                    <button
                      onClick={() => handleSelect(company.slug)}
                      className="flex min-h-[44px] w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-zinc-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900">{company.name}</p>
                        <p className="truncate text-xs text-zinc-500">
                          {company.category} · {company.district}
                        </p>
                      </div>
                      {company.reviewCount > 0 && (
                        <span className="ml-2 shrink-0 text-xs font-medium text-orange-500">
                          {company.avgRating.toFixed(1)} ★
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* OSM results not yet in DB */}
          {hasOsmResults && (
            <>
              <div className={`px-4 pt-3 pb-1 ${hasDbResults ? 'border-t border-zinc-100' : ''}`}>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-zinc-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Found on map · not yet reviewed
                  </span>
                </div>
              </div>
              <ul>
                {newOsmResults.map((biz) => (
                  <li key={biz.osmId}>
                    <Link
                      href={`/add-company?name=${encodeURIComponent(biz.name)}&category=${encodeURIComponent(biz.category)}&district=${encodeURIComponent(biz.district)}${biz.website ? `&website=${encodeURIComponent(biz.website)}` : ''}`}
                      onClick={() => { setOpen(false); setQuery('') }}
                      className="flex min-h-[44px] w-full items-center justify-between px-4 py-3 transition-colors hover:bg-zinc-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900">{biz.name}</p>
                        <p className="truncate text-xs text-zinc-500">
                          {biz.category} · {biz.district}
                        </p>
                      </div>
                      <span className="ml-2 shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                        Add →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Loading shimmer */}
          {isLoading && !hasDbResults && !hasOsmResults && (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-zinc-100" />
              ))}
            </div>
          )}

          {/* Nothing found anywhere */}
          {showNotFound && (
            <div className="p-6 text-center">
              <p className="text-sm text-zinc-500">
                No results for <span className="font-medium text-zinc-900">&ldquo;{query}&rdquo;</span>
              </p>
              <Link
                href={`/add-company?name=${encodeURIComponent(query)}`}
                onClick={() => { setOpen(false); setQuery('') }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                <Plus className="h-4 w-4" />
                Add &ldquo;{query}&rdquo; to the directory
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
