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
    <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <MarketStatusBadge status={market.status} />
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              {market.category}
            </span>
          </div>

          <Link
            href={`/markets/${market.id}`}
            className="mt-4 inline-flex items-start gap-2 text-xl font-semibold text-white transition hover:text-cyan-100"
          >
            <span className="line-clamp-2">{market.question}</span>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0" />
          </Link>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                Your Outcome
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {market.outcome_labels[position.outcome_index]}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                Your Stake
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {formatRIALO(position.amount)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                Implied Probability
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {impliedProbability}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                Opened
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {format(position.created_at, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
          <p className="text-sm text-slate-300">
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
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {claimablePayout ? 'Claim Payout' : 'Claim Refund'}
            </button>
          ) : null}

          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        </div>
      </div>
    </article>
  )
}
