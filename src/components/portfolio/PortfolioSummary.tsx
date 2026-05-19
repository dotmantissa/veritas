import { BarChart3, TrendingDown, TrendingUp, WalletCards } from 'lucide-react'

import { formatRIALO } from '@/lib/utils'

interface PortfolioSummaryProps {
  totalStaked: number
  totalClaimed: number
  openPositions: number
  pnl: number
}

export function PortfolioSummary({
  totalStaked,
  totalClaimed,
  openPositions,
  pnl,
}: PortfolioSummaryProps) {
  const isPositive = pnl >= 0

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-xl border border-border bg-bg-card p-5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-bg-surface text-accent">
          <WalletCards className="h-5 w-5" />
        </span>
        <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-text-muted">
          Total Staked
        </p>
        <p className="mt-2 font-display text-4xl uppercase tracking-[0.04em] text-accent">
          {formatRIALO(totalStaked)}
        </p>
      </article>

      <article className="rounded-xl border border-border bg-bg-card p-5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-bg-surface text-status-open">
          <TrendingUp className="h-5 w-5" />
        </span>
        <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-text-muted">
          Total Won
        </p>
        <p className="mt-2 font-display text-4xl uppercase tracking-[0.04em] text-accent">
          {formatRIALO(totalClaimed)}
        </p>
      </article>

      <article className="rounded-xl border border-border bg-bg-card p-5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-bg-surface text-status-resolved">
          <BarChart3 className="h-5 w-5" />
        </span>
        <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-text-muted">
          Open Positions
        </p>
        <p className="mt-2 font-display text-4xl uppercase tracking-[0.04em] text-accent">
          {openPositions}
        </p>
      </article>

      <article className="rounded-xl border border-border bg-bg-card p-5">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-bg-surface ${
            isPositive
              ? 'text-status-open'
              : 'text-status-disputed'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-5 w-5" />
          ) : (
            <TrendingDown className="h-5 w-5" />
          )}
        </span>
        <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-text-muted">Net P&amp;L</p>
        <p
          className={`mt-2 font-display text-4xl uppercase tracking-[0.04em] ${
            isPositive ? 'text-status-open' : 'text-status-disputed'
          }`}
        >
          {isPositive ? '+' : ''}
          {formatRIALO(pnl)}
        </p>
      </article>
    </section>
  )
}
