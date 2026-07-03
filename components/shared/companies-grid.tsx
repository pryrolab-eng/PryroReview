'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SlidersHorizontal, ChevronDown, Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

const PAGE_SIZE = 12

// Stagger directions based on card index
function getEntryVariant(index: number) {
  const directions = [
    { x: -40, y: 0 },  // left
    { x: 0,  y: 30 },  // bottom
    { x: 40, y: 0 },   // right
    { x: 0,  y: -30 }, // top
  ]
  const d = directions[index % directions.length]
  return {
    hidden: { opacity: 0, x: d.x, y: d.y, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1, x: 0, y: 0, scale: 1,
      transition: { delay: (i % PAGE_SIZE) * 0.04, duration: 0.35, ease: 'easeOut' },
    }),
  }
}

export function CompaniesGrid({ allCompanies, categories }: CompaniesGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [page, setPage] = useState(1)

  const filtered = selectedCategory
    ? allCompanies.filter((c) => c.category === selectedCategory)
    : allCompanies

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  const handleCategoryChange = (cat: string | null) => {
    setSelectedCategory(cat)
    setPage(1)
    setFilterOpen(false)
  }

  return (
    <div className="flex gap-6 items-start">

      {/* ── Left sidebar: leaderboard list ── */}
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

      {/* ── Company grid ── */}
      <div className="flex-1 min-w-0">

        {/* Header */}
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
                  onClick={() => handleCategoryChange(null)}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedCategory === null ? 'bg-zinc-100 text-zinc-900 font-semibold' : 'text-zinc-700 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
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

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-200 p-16 text-center">
            <Building2 className="mx-auto h-8 w-8 text-zinc-400" />
            <p className="mt-3 text-sm text-zinc-500">No companies in this category yet.</p>
          </div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-3 gap-4 xl:grid-cols-4"
              layout
            >
              <AnimatePresence mode="popLayout">
                {visible.map((c, i) => {
                  const variant = getEntryVariant(i)
                  return (
                    <motion.div
                      key={c.id}
                      custom={i}
                      variants={variant}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                      whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.15 } }}
                      layout
                    >
                      <CompanyCard company={c} />
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>

            {/* Load More / View All */}
            <div className="mt-8 flex items-center justify-center gap-4">
              {hasMore && (
                <motion.button
                  onClick={() => setPage((p) => p + 1)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-zinc-700 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  Load more
                </motion.button>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  )
}
