import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowRight, Clock3, Layers3 } from 'lucide-react'

import type { Market } from '@/lib/types'
import { formatRIALO } from '@/lib/utils'

import { CountdownTimer } from './CountdownTimer'
import { MarketStatusBadge } from './MarketStatusBadge'
import { OutcomeBar } from './OutcomeBar'

const statusStripStyles: Record<string, string> = {
  Open: 'from-status-open/80 via-status-open to-status-open/80',
  Resolving: 'from-status-resolving/80 via-status-resolving to-status-resolving/80',
  Resolved: 'from-status-resolved/80 via-status-resolved to-status-resolved/80',
  Disputed: 'from-status-disputed/80 via-status-disputed to-status-disputed/80',
  Cancelled: 'from-status-cancelled/80 via-status-cancelled to-status-cancelled/80',
}

export function MarketCard({ market }: { market: Market }) {
  const stripClass = statusStripStyles[market.status] ?? statusStripStyles.Open

  return (
    <article className="card-elevated card-interactive group relative h-full overflow-hidden rounded-xl">
      <div className={`h-1 w-full bg-gradient-to-r ${stripClass}`} />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <MarketStatusBadge status={market.status} />
            <span className="rounded-full border border-border bg-bg-surface/60 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-text-muted">
              {market.category}
            </span>
          </div>
        </div>

        <Link href={`/markets/${market.id}`} className="mt-5 block">
          <h3 className="line-clamp-2 text-base font-semibold leading-7 text-text-primary transition group-hover:text-accent-soft">
            {market.question}
          </h3>
        </Link>

        <div className="mt-5">
          <OutcomeBar
            outcomes={market.outcome_labels}
            pools={market.outcome_pools}
            totalPool={market.total_pool}
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 text-[12px] text-text-muted">
          <span className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.12em]">
            <Layers3 className="h-3.5 w-3.5" />
            {formatRIALO(market.total_pool)}
          </span>
          {market.status === 'Open' ? (
            <CountdownTimer deadline={market.deadline} />
          ) : (
            <span className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.12em]">
              <Clock3 className="h-3.5 w-3.5" />
              {market.resolution_detail
                ? `Resolved ${format(market.resolution_detail.resolved_at, 'MMM d')}`
                : 'Resolved'}
            </span>
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[rgba(7,7,7,0.94)] via-[rgba(7,7,7,0.7)] to-transparent p-5 opacity-0 backdrop-blur-[2px] transition duration-200 ease-out group-hover:opacity-100">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            Resolution Sources
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {market.resolution_sources.slice(0, 3).map((source) => (
              <span
                key={`${market.id}:${source.label}`}
                className="rounded-full border border-border bg-bg-base/90 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-secondary"
              >
                <span className="mr-1.5 text-status-open">●</span>
                {source.label}
              </span>
            ))}
          </div>
          <Link
            href={`/markets/${market.id}`}
            className="pointer-events-auto inline-flex w-fit items-center gap-2 rounded-full border border-accent/50 bg-accent-subtle px-4 py-2 text-sm font-semibold text-accent transition hover:border-accent hover:text-accent-soft"
          >
            View Market
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}
