'use client'

import { SearchBar } from '@/components/shared/search-bar'

export function SearchHero() {
  return (
    <div className="flex flex-col items-center text-center gap-6">

      {/* Heading */}
      <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 md:text-6xl">
        Share your Experience
      </h1>

      {/* Search bar */}
      <div className="w-full max-w-[584px] mx-auto">
        <SearchBar />
      </div>

    </div>
  )
}
