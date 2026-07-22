'use client'

import { SearchBar } from '@/components/shared/search-bar'

export function SearchHero() {
  return (
    <div className="flex flex-col items-center text-center gap-5">

      {/* Heading */}
      <h1 className="mx-auto max-w-2xl text-2xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-3xl md:text-5xl">
        Share Your Review
      </h1>

      {/* Search bar */}
      <div className="w-full max-w-xl mx-auto">
        <SearchBar />
      </div>

    </div>
  )
}
