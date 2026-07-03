'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SlidersHorizontal, ChevronDown, ArrowRight, Building2 } from 'lucide-react'
import { CompanyCard } from '@/components/shared/company-card'

interface Company {
  id: string
  name: string
  slug: string
  category: string
  district: string
  website: string | null
  verified: boolean
  avgRating: number
  reviewCount: number
}

interface RankedCompany {
  id: string
  rank: number
  name: string
  slug: string
  category: string
  website: string | null
  avgRating: number
  reviewCount: number
}

interface CompaniesGridProps {
  allCompanies: Company[]
  topRanked: RankedCompany[]
  categories: string[]
}

export function CompaniesGrid({ allCompanies, topRanked, categories }: CompaniesGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const filtered = selectedCategory
    ? allCompanies.filter((c) => c.category === selectedCategory)
    : allCompanies

  return (
    <div className="flex gap-6 items-start">

      {/* ── Left sidebar: all businesses list ── */}
      <div className="hidden lg:block w-64 shrink-0 sticky top-20 self-start">
        <h3 className="text-base font-semibold text-zinc-900 pb-3 border-b border-gray-200 mb-1">
          Leaderboard
        </h3>
        <ul>
          {allCompanies.slice(0, 10).map((c) => (
            <li key={c.id}>
              <Link
                href={`/company/${c.slug}`}
                className="block py-2 px-1 text-sm text-zinc-700 hover:text-blue-600 transition-colors truncate"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
        {allCompanies.length > 10 && (
          <Link
            href="/leaderboard"
            className="mt-2 block px-1 text-xs font-semibold text-blue-600 hover:underline"
          >
            View all {allCompanies.length} →
          </Link>
        )}
      </div>

      {/* ── Right: company grid ── */}
      <div className="flex-1 min-w-0">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">
            {selectedCategory ?? 'All Businesses'}
          </h2>
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:border-gray-300 hover:text-zinc-900 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-gray-200 bg-white shadow-lg p-2">
                <button
                  onClick={() => { setSelectedCategory(null); setFilterOpen(false) }}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedCategory === null ? 'bg-zinc-100 text-zinc-900 font-semibold' : 'text-zinc-700 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setFilterOpen(false) }}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                      selectedCategory === cat ? 'bg-zinc-100 text-zinc-900 font-semibold' : 'text-zinc-700 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-200 p-16 text-center">
            <Building2 className="mx-auto h-8 w-8 text-zinc-400" />
            <p className="mt-3 text-sm text-zinc-500">No companies in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 xl:grid-cols-4">
            {filtered.slice(0, 12).map((c) => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:underline"
          >
            View all {allCompanies.length} companies <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

    </div>
  )
}
