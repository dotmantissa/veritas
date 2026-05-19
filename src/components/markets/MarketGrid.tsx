'use client'

import { useMemo, useState } from 'react'
import { Telescope } from 'lucide-react'
import Link from 'next/link'

import type { Market, MarketCategory, MarketStatus } from '@/lib/types'

import { MarketCard } from './MarketCard'

const statusFilters: Array<'All' | MarketStatus> = [
  'All',
  'Open',
  'Resolving',
  'Resolved',
  'Disputed',
]

export function MarketGrid({ markets }: { markets: Market[] }) {
  const [status, setStatus] = useState<'All' | MarketStatus>('All')
  const [category, setCategory] = useState<'All' | MarketCategory>('All')

  const categoryFilters: Array<'All' | MarketCategory> = [
    'All',
    'Sports',
    'Finance',
    'Crypto',
    'Weather',
    'Politics',
  ]

  const filteredMarkets = useMemo(() => {
    return markets.filter((market) => {
      const statusMatch = status === 'All' || market.status === status
      const categoryMatch = category === 'All' || market.category === category
      return statusMatch && categoryMatch
    })
  }, [category, markets, status])

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border border-border bg-bg-card p-5">
        <div className="flex flex-wrap gap-2">
          {categoryFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setCategory(filter)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                category === filter
                  ? 'border-accent-hot bg-accent-hot text-white'
                  : 'border-border bg-bg-card text-text-secondary hover:border-text-muted hover:text-text-primary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatus(filter)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                status === filter
                  ? 'border-accent-hot bg-accent-hot text-white'
                  : 'border-border bg-bg-card text-text-secondary hover:border-text-muted hover:text-text-primary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {filteredMarkets.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-bg-card px-6 py-14 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-bg-surface text-accent">
            <Telescope className="h-5 w-5" />
          </span>
          <p className="mt-5 text-lg font-semibold text-text-primary">
            No markets here yet.
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Try another filter, or create the next market yourself.
          </p>
          <Link
            href="/markets/create"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-accent-hot px-6 py-3 text-sm font-semibold text-white transition duration-150 ease-out hover:scale-[1.02] hover:brightness-110 active:scale-[0.97]"
          >
            Create the first one →
          </Link>
        </div>
      )}
    </div>
  )
}
