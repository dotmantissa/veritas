'use client'

import { Activity, Sparkles } from 'lucide-react'

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
      <section className="relative overflow-hidden rounded-[24px] border border-border bg-bg-surface/80 px-6 py-12 sm:px-10 shadow-card-elevated">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-10 h-64 w-64 rounded-full bg-accent/8 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-accent-hot/8 blur-3xl"
        />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-base/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Live Markets
          </span>

          <div className="mt-4">
            <SectionTitle
              title="ALL MARKETS"
              accentWord="MARKETS"
              subtitle="Inspect open, resolving, resolved, and disputed markets exactly as they would appear on a live Rialo client."
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-card px-4 py-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-status-open/10 text-status-open">
                <Activity className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-2xl uppercase tracking-[0.06em] text-text-primary">
                  {openCount}
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                  Open
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-card px-4 py-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-status-resolving/10 text-status-resolving">
                <Activity className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-2xl uppercase tracking-[0.06em] text-text-primary">
                  {resolvingCount}
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                  Resolving
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-card px-4 py-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-status-resolved/10 text-status-resolved">
                <Activity className="h-4 w-4" />
              </span>
              <div>
                <p className="font-display text-2xl uppercase tracking-[0.06em] text-text-primary">
                  {resolvedCount}
                </p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                  Resolved
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketGrid markets={markets} />
    </div>
  )
}
