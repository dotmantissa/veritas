import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowRight, Clock3, Layers3 } from 'lucide-react'

import type { Market } from '@/lib/types'
import { formatRIALO } from '@/lib/utils'

import { CountdownTimer } from './CountdownTimer'
import { MarketStatusBadge } from './MarketStatusBadge'
import { OutcomeBar } from './OutcomeBar'

export function MarketCard({ market }: { market: Market }) {
  return (
    <article className="group relative h-full overflow-hidden rounded-xl border border-border bg-bg-card transition duration-200 ease-out hover:border-text-muted hover:bg-bg-card-hover hover:shadow-[0_0_0_1px_var(--text-muted)]">
      <div
        className={`h-1 w-full ${
          market.status === 'Open'
            ? 'bg-status-open'
            : market.status === 'Resolving'
              ? 'bg-status-resolving'
              : market.status === 'Resolved'
                ? 'bg-status-resolved'
                : market.status === 'Disputed'
                  ? 'bg-status-disputed'
                  : 'bg-status-cancelled'
        }`}
      />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <MarketStatusBadge status={market.status} />
            <span className="rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-text-muted">
              {market.category}
            </span>
          </div>
        </div>

        <Link href={`/markets/${market.id}`} className="mt-5 block">
          <h3 className="line-clamp-2 text-base font-semibold leading-7 text-text-primary">
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

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-[rgba(8,8,8,0.86)] p-5 opacity-0 transition duration-200 ease-out group-hover:opacity-100">
          <div className="mb-4 flex flex-wrap gap-2">
            {market.resolution_sources.slice(0, 3).map((source) => (
              <span
                key={`${market.id}:${source.label}`}
                className="rounded-full border border-border bg-bg-base px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-secondary"
              >
                ● {source.label}
              </span>
            ))}
          </div>
          <Link
            href={`/markets/${market.id}`}
            className="pointer-events-auto inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-text-primary"
          >
            View Market
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}
