'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { PortfolioSummary } from '@/components/portfolio/PortfolioSummary'
import { PositionCard } from '@/components/portfolio/PositionCard'
import type { Market, Position } from '@/lib/types'
import { useMarketStore } from '@/store/marketStore'
import { useWalletStore } from '@/store/walletStore'

type PortfolioTab = 'Open Positions' | 'Claimable' | 'History'

function estimatePositionValue(position: Position, market: Market): number {
  if (position.claimed) {
    return 0
  }

  if (
    market.status === 'Resolved' &&
    market.resolved_outcome === position.outcome_index
  ) {
    const winnerPool = market.outcome_pools[position.outcome_index] ?? 0

    if (winnerPool <= 0) {
      return 0
    }

    return (position.amount / winnerPool) * (market.total_pool * 0.98)
  }

  if (market.status === 'Disputed' || market.status === 'Cancelled') {
    return position.amount
  }

  return position.amount
}

export default function PortfolioPage() {
  const wallet = useWalletStore((state) => state.wallet)
  const txHistory = useWalletStore((state) => state.txHistory)
  const markets = useMarketStore((state) => state.markets)
  const positions = useMarketStore((state) => state.positions)
  const [tab, setTab] = useState<PortfolioTab>('Open Positions')

  const walletPositions = useMemo(() => {
    if (!wallet?.connected) {
      return []
    }

    return positions.filter((position) => position.owner === wallet.address)
  }, [positions, wallet])

  const positionsWithMarkets = useMemo(() => {
    return walletPositions
      .map((position) => ({
        position,
        market: markets.find((market) => market.id === position.market_id),
      }))
      .filter(
        (entry): entry is { position: Position; market: Market } =>
          entry.market !== undefined
      )
      .sort((left, right) => right.position.created_at - left.position.created_at)
  }, [markets, walletPositions])

  const filteredEntries = useMemo(() => {
    if (tab === 'Open Positions') {
      return positionsWithMarkets.filter(
        ({ position, market }) =>
          !position.claimed &&
          (market.status === 'Open' || market.status === 'Resolving')
      )
    }

    if (tab === 'Claimable') {
      return positionsWithMarkets.filter(
        ({ position, market }) =>
          !position.claimed &&
          ((market.status === 'Resolved' &&
            market.resolved_outcome === position.outcome_index) ||
            market.status === 'Disputed' ||
            market.status === 'Cancelled')
      )
    }

    return positionsWithMarkets
  }, [positionsWithMarkets, tab])

  const summary = useMemo(() => {
    const totalStaked = walletPositions.reduce(
      (sum, position) => sum + position.amount,
      0
    )

    const totalClaimed = txHistory
      .filter(
        (tx) =>
          tx.status === 'confirmed' &&
          (tx.type === 'claim_payout' || tx.type === 'refund')
      )
      .reduce((sum, tx) => sum + (tx.amount ?? 0), 0)

    const unrealizedValue = positionsWithMarkets.reduce(
      (sum, entry) => sum + estimatePositionValue(entry.position, entry.market),
      0
    )

    return {
      totalStaked,
      totalClaimed,
      unrealizedValue,
      pnl: totalClaimed + unrealizedValue - totalStaked,
    }
  }, [positionsWithMarkets, txHistory, walletPositions])

  if (!wallet?.connected) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-semibold text-white">Portfolio</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Connect wallet to inspect your positions, claim payouts, and recover
          refunds from disputed markets.
        </p>
        <Link
          href="/markets"
          className="mt-6 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/35 hover:bg-cyan-400/15"
        >
          Browse Markets
        </Link>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-cyan-400/8 via-slate-900/90 to-slate-900 p-8 shadow-2xl shadow-slate-950/30">
        <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Portfolio
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Track positions, payouts, and refund eligibility
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          Your connected mock Rialo wallet sees the same position lifecycle a live
          client would: open exposure, claimable winnings, and disputed-market
          refunds.
        </p>
      </section>

      <PortfolioSummary {...summary} />

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap gap-2">
          {(['Open Positions', 'Claimable', 'History'] as PortfolioTab[]).map(
            (entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setTab(entry)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  tab === entry
                    ? 'bg-cyan-300 text-slate-950'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:text-white'
                }`}
              >
                {entry}
              </button>
            )
          )}
        </div>

        <div className="mt-6 space-y-5">
          {filteredEntries.length > 0 ? (
            filteredEntries.map(({ market, position }) => (
              <PositionCard
                key={position.id}
                market={market}
                position={position}
              />
            ))
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/40 px-6 py-12 text-center">
              <p className="text-lg font-medium text-white">
                Nothing to show in {tab.toLowerCase()}.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Place more bets or switch tabs to inspect other portfolio states.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
