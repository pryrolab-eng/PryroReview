'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, Building2 } from 'lucide-react'
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
  badReviewCompanies: { id: string; name: string; slug: string; category: string; website: string | null; badReviewCount: number }[]
  categories: string[]
  initialCategory?: string | null
}

const PAGE_SIZE = 32

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
      transition: { delay: (i % PAGE_SIZE) * 0.04, duration: 0.35, ease: 'easeOut' as const },
    }),
  }
}

const SIDEBAR_PAGE_SIZE = 10

function CompanyFavicon({ name, website }: { name: string; website?: string | null }) {
  const [failed, setFailed] = useState(false)
  const domain = website
    ? (() => { try { return new URL(website).hostname.replace(/^www\./, '') } catch { return null } })()
    : null

  if (!domain || failed) {
    return (
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-100 text-[9px] font-bold text-zinc-600">
        {name[0].toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt={name}
      onError={() => setFailed(true)}
      className="h-5 w-5 rounded object-contain shrink-0"
    />
  )
}

function LeaderboardSidebar({ allCompanies }: { allCompanies: Company[] }) {
  const [page, setPage] = useState(1)

  const sorted = [...allCompanies].sort((a, b) => {
    if (a.reviewCount > 0 && b.reviewCount === 0) return -1
    if (a.reviewCount === 0 && b.reviewCount > 0) return 1
    return b.avgRating - a.avgRating || b.reviewCount - a.reviewCount
  })

  const totalPages = Math.ceil(sorted.length / SIDEBAR_PAGE_SIZE)
  const visible = sorted.slice((page - 1) * SIDEBAR_PAGE_SIZE, page * SIDEBAR_PAGE_SIZE)

  if (sorted.length === 0) {
    return <p className="py-4 text-xs text-zinc-400">No companies yet.</p>
  }

  return (
    <div>
      <ul className="space-y-0.5">
        {visible.map((c, i) => {
          const globalRank = (page - 1) * SIDEBAR_PAGE_SIZE + i + 1
          return (
            <li key={c.id}>
              <Link
                href={`/company/${c.slug}`}
                className="flex items-center gap-2 py-1.5 px-1 rounded-md hover:bg-zinc-50 transition-colors group"
              >
                <span className="w-5 shrink-0 text-center text-[11px] font-bold text-zinc-900">
                  {globalRank}
                </span>
                <CompanyFavicon name={c.name} website={c.website} />
                <div className="min-w-0 flex-1">
                  <span className="truncate text-sm text-zinc-700 group-hover:text-zinc-950 block">
                    {c.name}
                  </span>
                </div>
                <span className="shrink-0 flex items-center gap-0.5 text-[11px]">
                  <span className="text-zinc-700 font-medium">{c.reviewCount}</span>
                  <span className="text-blue-600 text-[20px] leading-none">★</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center justify-center h-7 w-7 rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center justify-center h-7 w-7 rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function WorstRatedSidebar({ companies }: { companies: { id: string; name: string; slug: string; website: string | null; badReviewCount: number }[] }) {
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(companies.length / SIDEBAR_PAGE_SIZE)
  const visible = companies.slice((page - 1) * SIDEBAR_PAGE_SIZE, page * SIDEBAR_PAGE_SIZE)

  if (companies.length === 0) {
    return <p className="py-4 text-xs text-zinc-400">No bad reviews yet.</p>
  }

  return (
    <div>
      <ul className="space-y-0.5">
        {visible.map((c, i) => {
          const globalRank = (page - 1) * SIDEBAR_PAGE_SIZE + i + 1
          return (
            <li key={c.id}>
              <Link
                href={`/company/${c.slug}`}
                className="flex items-center gap-2 py-1.5 px-1 rounded-md hover:bg-zinc-50 transition-colors group"
              >
                <span className="w-5 shrink-0 text-center text-[11px] font-bold text-red-500">
                  {globalRank}
                </span>
                <CompanyFavicon name={c.name} website={c.website} />
                <div className="min-w-0 flex-1">
                  <span className="truncate text-sm text-zinc-700 group-hover:text-zinc-950 block">
                    {c.name}
                  </span>
                </div>
                <span className="shrink-0 flex items-center gap-0.5 text-[11px]">
                  <span className="text-zinc-700 font-medium">{c.badReviewCount}</span>
                  <span className="text-blue-600 text-[20px] leading-none">★</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center justify-center h-7 w-7 rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center justify-center h-7 w-7 rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export function CompaniesGrid({ allCompanies, topRanked, badReviewCompanies, categories, initialCategory }: CompaniesGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory ?? null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [page, setPage] = useState(1)

  // Sync if initialCategory changes (e.g. back/forward navigation)
  useEffect(() => {
    setSelectedCategory(initialCategory ?? null)
    setPage(1)
  }, [initialCategory])

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

      {/* ── Left sidebar: leaderboard by rating ── */}
      <div className="hidden lg:block w-64 shrink-0 sticky top-20 self-start">
        <div className="mb-2">
          <h3 className="text-sm font-bold text-zinc-900">Leaderboard</h3>
        </div>
        <LeaderboardSidebar allCompanies={allCompanies} />

        {/* Bad Reviews section */}
        <div className="mt-6 mb-2">
          <h3 className="text-sm font-bold text-zinc-900">Bad Reviews</h3>
        </div>
        <WorstRatedSidebar companies={badReviewCompanies} />
      </div>

      {/* ── Company grid ── */}
      <div className="flex-1 min-w-0">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">
            {selectedCategory ? `${selectedCategory} Companies` : 'All Businesses'}
          </h2>
          <div className="relative">
            {/* Smaller Filter button */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-zinc-600 hover:border-gray-300 hover:text-zinc-900 transition-colors"
            >
              <SlidersHorizontal className="h-3 w-3" />
              Filter
              <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${filterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown with internal scroll — max height so it never overflows the page */}
            {filterOpen && (
              <div className="absolute right-0 top-8 z-50 w-52 rounded-xl border border-gray-200 bg-white shadow-lg p-2 max-h-72 overflow-y-auto">
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
                      selectedCategory === cat ? 'bg-zinc-100 text-blue-600 font-semibold' : 'text-zinc-700 hover:bg-gray-50'
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
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
