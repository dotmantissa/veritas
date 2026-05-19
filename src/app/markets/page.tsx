'use client'

import { SectionTitle } from '@/components/ui/SectionTitle'
import { MarketGrid } from '@/components/markets/MarketGrid'
import { useMarketStore } from '@/store/marketStore'

export default function MarketsPage() {
  const markets = useMarketStore((state) => state.markets)
  const openCount = markets.filter((market) => market.status === 'Open').length
  const resolvingCount = markets.filter(
    (market) => market.status === 'Resolving'
  ).length
  const resolvedCount = markets.filter(
    (market) => market.status === 'Resolved'
  ).length

  return (
    <div className="space-y-8">
      <section className="rounded-[20px] border border-border bg-bg-surface px-6 py-12 sm:px-8">
        <SectionTitle
          title="ALL MARKETS"
          accentWord="MARKETS"
          subtitle="Inspect open, resolving, resolved, and disputed markets exactly as they would appear on a live Rialo client."
        />

        <div className="mt-6 flex flex-wrap gap-3 font-mono text-[12px] uppercase tracking-[0.12em] text-text-muted">
          <span>{openCount} Open</span>
          <span>·</span>
          <span>{resolvingCount} Resolving</span>
          <span>·</span>
          <span>{resolvedCount} Resolved</span>
        </div>
      </section>

      <MarketGrid markets={markets} />
    </div>
  )
}
