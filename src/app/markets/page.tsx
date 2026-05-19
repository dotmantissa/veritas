'use client'

import { MarketGrid } from '@/components/markets/MarketGrid'
import { useMarketStore } from '@/store/marketStore'

export default function MarketsPage() {
  const markets = useMarketStore((state) => state.markets)

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/10 via-slate-900/90 to-slate-900 p-8 shadow-2xl shadow-slate-950/30">
        <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Live Market Feed
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Browse Veritas Markets
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          Inspect open, resolving, resolved, and disputed markets exactly as they
          would appear on a live Rialo testnet client, with real local state and
          persistent trading history.
        </p>
      </section>

      <MarketGrid markets={markets} />
    </div>
  )
}
