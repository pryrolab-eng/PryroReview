'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

interface CategoryFilterProps {
  categories: { name: string; count: number }[]
  selected?: string
}

export function CategoryFilter({ categories, selected }: CategoryFilterProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const label = selected || 'All Categories'

  const handleSelect = (cat: string | null) => {
    setOpen(false)
    if (cat) {
      router.push(`/?category=${encodeURIComponent(cat)}`)
    } else {
      router.push('/')
    }
  }

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger */}
      <button
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-slate-600 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-64 rounded-md border border-zinc-200 bg-white py-1.5 shadow-md">
          <button
            onClick={() => handleSelect(null)}
            className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
              !selected ? 'font-semibold text-slate-900' : 'text-slate-600'
            }`}
          >
            <span>All Categories</span>
            <span className="text-xs text-slate-400">{categories.reduce((s, c) => s + c.count, 0)}</span>
          </button>
          <div className="my-1 border-t border-slate-100" />
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleSelect(cat.name)}
              className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
                selected === cat.name ? 'font-semibold text-slate-900' : 'text-slate-600'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-xs text-slate-400">{cat.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
