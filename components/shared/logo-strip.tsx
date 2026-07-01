'use client'

import { useState } from 'react'

interface LogoStripProps {
  companies: { id: string; name: string; website: string }[]
}

function Logo({ name, website }: { name: string; website: string }) {
  const [failed, setFailed] = useState(false)
  let domain = ''
  try { domain = new URL(website).hostname.replace(/^www\./, '') } catch {}

  if (!domain || failed) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 text-[11px] font-bold text-zinc-900">
        {name[0].toUpperCase()}
      </span>
    )
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={name}
      title={name}
      onError={() => setFailed(true)}
      className="h-8 w-8 object-contain transition-opacity duration-200 hover:opacity-80"
    />
  )
}

export function LogoStrip({ companies }: LogoStripProps) {
  if (companies.length === 0) return null

  // Duplicate for seamless loop
  const items = [...companies, ...companies]

  return (
    <div className="w-full overflow-hidden py-6">
      <div className="flex animate-marquee gap-10 whitespace-nowrap">
        {items.map((c, i) => (
          <div key={`${c.id}-${i}`} className="flex shrink-0 items-center">
            <Logo name={c.name} website={c.website} />
          </div>
        ))}
      </div>
    </div>
  )
}
