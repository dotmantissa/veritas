'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ArrowUpRight, Loader2 } from 'lucide-react'

import { MarketStatusBadge } from '@/components/markets/MarketStatusBadge'
import { claimPayout, claimRefund } from '@/lib/mock/contract'
import type { Market, Position } from '@/lib/types'
import {
  calcImpliedProbability,
  formatRIALO,
} from '@/lib/utils'
import { useWalletStore } from '@/store/walletStore'

interface PositionCardProps {
  market: Market
  position: Position
}

export function PositionCard({ market, position }: PositionCardProps) {
  const wallet = useWalletStore((state) => state.wallet)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const outcomeStyles = [
    'bg-accent text-bg-base',
    'bg-accent-hot text-white',
    'bg-status-resolved text-white',
    'bg-status-open text-bg-base',
    'bg-status-resolving text-bg-base',
  ]

  const winning = market.resolved_outcome === position.outcome_index
  const claimablePayout =
    market.status === 'Resolved' && winning && !position.claimed
  const claimableRefund =
    (market.status === 'Disputed' || market.status === 'Cancelled') &&
    !position.claimed

  const impliedProbability = useMemo(() => {
    return calcImpliedProbability(
      market.outcome_pools[position.outcome_index] ?? 0,
      market.total_pool
    )
  }, [market.outcome_pools, market.total_pool, position.outcome_index])

  const outcomeColor = outcomeStyles[position.outcome_index % outcomeStyles.length]

  async function handleClaim(): Promise<void> {
    if (!wallet || !wallet.connected) {
      setError('Connect wallet to claim funds.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      if (claimablePayout) {
        await claimPayout(wallet, position.id)
      } else if (claimableRefund) {
        await claimRefund(wallet, position.id)
      }
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : 'Claim failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <article className="card-elevated card-interactive rounded-xl p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4 min-w-0 flex-1">
          <div className={`hidden w-1 rounded-full sm:block ${outcomeColor.split(' ')[0]}`} />
          <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <MarketStatusBadge status={market.status} />
            <span className="rounded-full border border-border bg-bg-surface px-3 py-1 text-xs font-medium text-text-secondary">
              {market.category}
            </span>
          </div>

          <Link
            href={`/markets/${market.id}`}
            className="mt-4 inline-flex items-start gap-2 text-lg font-semibold text-text-primary transition hover:text-accent"
          >
            <span className="line-clamp-2">{market.question}</span>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0" />
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${outcomeColor}`}>
              {market.outcome_labels[position.outcome_index]}
            </span>
            <span className="font-mono text-sm text-text-primary">
              {formatRIALO(position.amount)}
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
              Opened {format(position.created_at, 'MMM d, yyyy')}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-border bg-bg-surface px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">
                Your Outcome
              </p>
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {market.outcome_labels[position.outcome_index]}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-bg-surface px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">
                Your Stake
              </p>
              <p className="mt-2 font-mono text-sm text-text-primary">
                {formatRIALO(position.amount)}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-bg-surface px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">
                Implied Probability
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg-base">
                <div
                  className={`h-full transition-[width] duration-500 ${outcomeColor.split(' ')[0]}`}
                  style={{ width: impliedProbability }}
                />
              </div>
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {impliedProbability}
              </p>
            </div>
          </div>
        </div>
        </div>

        <div className="w-full max-w-xs rounded-xl border border-border bg-bg-surface p-4">
          <p className="text-sm text-text-secondary">
            {position.claimed
              ? 'Funds already claimed.'
              : claimablePayout
                ? 'Winning position. Payout is ready.'
                : claimableRefund
                  ? 'Consensus failed. Refund is available.'
                  : market.status === 'Resolved'
                    ? 'This position did not finish in the money.'
                    : 'Position remains active until settlement.'}
          </p>

          {(claimablePayout || claimableRefund) && !position.claimed ? (
            <button
              type="button"
              onClick={() => void handleClaim()}
              disabled={isSubmitting}
              className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-display text-xl uppercase tracking-[0.08em] transition duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-60 ${
                claimablePayout
                  ? 'button-primary bg-accent text-bg-base'
                  : 'border border-border bg-transparent text-text-primary hover:border-border-strong hover:bg-bg-card-hover'
              }`}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {claimablePayout ? 'Claim Payout →' : 'Claim Refund →'}
            </button>
          ) : null}

          {position.claimed ? (
            <p className="mt-4 text-sm text-status-open">✓ Claimed</p>
          ) : null}

          {error ? <p className="mt-3 text-sm text-status-disputed">{error}</p> : null}
        </div>
      </div>
    </article>
  )
}
