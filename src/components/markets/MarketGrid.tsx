'use client'

import { useMemo, useState } from 'react'

import { MARKET_CATEGORIES } from '@/lib/constants'
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

  const filteredMarkets = useMemo(() => {
    return markets.filter((market) => {
      const statusMatch = status === 'All' || market.status === status
      const categoryMatch = category === 'All' || market.category === category
      return statusMatch && categoryMatch
    })
  }, [category, markets, status])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatus(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                status === filter
                  ? 'bg-cyan-300 text-slate-950'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-300">
          <span>Category</span>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as 'All' | MarketCategory)
            }
            className="bg-transparent text-sm text-white outline-none"
          >
            <option value="All">All</option>
            {MARKET_CATEGORIES.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredMarkets.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/5 px-6 py-12 text-center">
          <p className="text-lg font-medium text-white">No markets match this filter.</p>
          <p className="mt-2 text-sm text-slate-400">
            Try another status or category to inspect the seeded Rialo simulation.
          </p>
        </div>
      )}
    </div>
  )
}
