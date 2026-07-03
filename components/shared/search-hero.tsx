'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/shared/search-bar'

const SUGGESTIONS = [
  'MTN Rwanda',
  'Bank of Kigali',
  'Airtel Rwanda',
  'RwandAir',
  'RSSB',
  'Irembo',
]

export function SearchHero() {
  const [initialQuery, setInitialQuery] = useState('')

  return (
    <div className="flex flex-col items-center text-center gap-6">

      {/* Heading */}
      <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 md:text-6xl">
        Share your Experience
      </h1>

      {/* Search bar */}
      <div className="w-full max-w-[584px] mx-auto">
        <SearchBar initialQuery={initialQuery} />
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setInitialQuery(s)}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm"
          >
            {s}
          </button>
        ))}
      </div>

    </div>
  )
}
