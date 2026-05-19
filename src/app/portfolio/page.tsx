'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Telescope } from 'lucide-react'

import { PortfolioSummary } from '@/components/portfolio/PortfolioSummary'
import { PositionCard } from '@/components/portfolio/PositionCard'
import { SectionTitle } from '@/components/ui/SectionTitle'
import type { Market, Position } from '@/lib/types'
import { useMarketStore } from '@/store/marketStore'
import { useWalletStore } from '@/store/walletStore'
import { formatAddress } from '@/lib/utils'

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
      openPositions: positionsWithMarkets.filter(
        ({ position, market }) =>
          !position.claimed &&
          (market.status === 'Open' || market.status === 'Resolving')
      ).length,
      unrealizedValue,
      pnl: totalClaimed + unrealizedValue - totalStaked,
    }
  }, [positionsWithMarkets, txHistory, walletPositions])

  if (!wallet?.connected) {
    return (
      <section className="rounded-xl border border-border bg-bg-card p-8">
        <SectionTitle
          title="Your Portfolio"
          accentWord="Portfolio"
          subtitle="Connect wallet to inspect your positions, claim payouts, and recover refunds from disputed markets."
        />
        <div className="mt-6">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-bg-surface text-accent">
            <Telescope className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-text-secondary">
          Connect wallet to inspect your positions, claim payouts, and recover
          refunds from disputed markets.
        </p>
        <Link
          href="/markets"
          className="mt-6 inline-flex rounded-lg bg-accent-hot px-6 py-3 text-sm font-semibold text-white transition duration-150 ease-out hover:scale-[1.02] hover:brightness-110 active:scale-[0.97]"
        >
          Browse Markets
        </Link>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-bg-card p-8 fade-up">
        <SectionTitle
          title="Your Portfolio"
          accentWord="Portfolio"
          subtitle="Track positions, payouts, and refund eligibility across your mock Rialo wallet."
        />
        <p className="mt-4 font-mono text-sm text-text-muted">
          {formatAddress(wallet.address)} · {wallet.label}
        </p>
      </section>

      <PortfolioSummary {...summary} />

      <section className="rounded-xl border border-border bg-bg-card p-6">
        <div className="flex flex-wrap gap-2">
          {(['Open Positions', 'Claimable', 'History'] as PortfolioTab[]).map(
            (entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setTab(entry)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  tab === entry
                    ? 'border-accent-hot bg-accent-hot text-white'
                    : 'border-border bg-bg-surface text-text-secondary hover:border-text-muted hover:text-text-primary'
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
            <div className="rounded-xl border border-dashed border-border bg-bg-surface px-6 py-12 text-center">
              <p className="text-lg font-medium text-text-primary">
                Nothing to show in {tab.toLowerCase()}.
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Place more bets or switch tabs to inspect other portfolio states.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
