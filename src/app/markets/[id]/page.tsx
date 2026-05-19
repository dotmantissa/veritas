'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import {
  BadgeInfo,
  Loader2,
  ShieldCheck,
  TimerReset,
  TriangleAlert,
} from 'lucide-react'

import { BetPanel } from '@/components/markets/BetPanel'
import { CountdownTimer } from '@/components/markets/CountdownTimer'
import { MarketStatusBadge } from '@/components/markets/MarketStatusBadge'
import { OutcomeBar } from '@/components/markets/OutcomeBar'
import { ResolutionConsole } from '@/components/markets/ResolutionConsole'
import { ResolutionSources } from '@/components/markets/ResolutionSources'
import { triggerResolution } from '@/lib/mock/contract'
import { formatAddress, formatRIALO } from '@/lib/utils'
import { useMarketStore } from '@/store/marketStore'
import { useWalletStore } from '@/store/walletStore'

export default function MarketDetailPage() {
  const params = useParams<{ id: string }>()
  const wallet = useWalletStore((state) => state.wallet)
  const market = useMarketStore((state) =>
    state.markets.find((entry) => entry.id === params.id)
  )
  const resolutionLog = useMarketStore(
    (state) => state.resolutionLog[params.id] ?? []
  )
  const [error, setError] = useState('')
  const [isResolving, setIsResolving] = useState(false)

  if (!market) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-semibold text-white">Market not found</h1>
        <p className="mt-3 text-slate-300">
          The requested market does not exist in the current mock chain state.
        </p>
        <Link href="/markets" className="mt-6 inline-block text-cyan-200 hover:text-cyan-100">
          Back to markets
        </Link>
      </section>
    )
  }

  const currentMarket = market

  const canTriggerResolution =
    currentMarket.status === 'Open' &&
    currentMarket.deadline < Date.now() &&
    wallet?.connected

  async function handleTriggerResolution(): Promise<void> {
    if (!wallet || !wallet.connected) {
      setError('Connect wallet to trigger resolution.')
      return
    }

    setError('')
    setIsResolving(true)

    try {
      await triggerResolution(wallet, currentMarket.id)
    } catch (resolutionError) {
      setError(
        resolutionError instanceof Error
          ? resolutionError.message
          : 'Unable to trigger resolution.'
      )
    } finally {
      setIsResolving(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-cyan-400/8 via-slate-900/90 to-slate-900 p-8 shadow-2xl shadow-slate-950/30">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <MarketStatusBadge status={market.status} />
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                {currentMarket.category}
              </span>
              {currentMarket.status === 'Open' ? (
                <CountdownTimer deadline={currentMarket.deadline} />
              ) : null}
            </div>

            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              {currentMarket.question}
            </h1>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-300">
              <span>Creator {formatAddress(currentMarket.creator)}</span>
              <span>Created {format(currentMarket.created_at, 'MMM d, yyyy · h:mm a')}</span>
              <span>{currentMarket.resolution_sources.length} locked sources</span>
            </div>

            {currentMarket.status === 'Resolved' &&
            currentMarket.resolved_outcome !== null ? (
              <p className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                <ShieldCheck className="h-4 w-4" />
                Winning outcome:{' '}
                {currentMarket.outcome_labels[currentMarket.resolved_outcome]}
              </p>
            ) : null}

            {currentMarket.status === 'Disputed' ? (
              <p className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                <TriangleAlert className="h-4 w-4" />
                Consensus failed. Positions can be refunded.
              </p>
            ) : null}
          </div>

          <div className="w-full max-w-sm rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Total Pool
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {formatRIALO(currentMarket.total_pool)}
            </p>
            <p className="mt-5 text-sm text-slate-300">
              Consensus threshold: {currentMarket.consensus_threshold}/
              {currentMarket.resolution_sources.length}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Protocol fee: 0.000005 RIALO gas, 2% settlement fee
            </p>

            {canTriggerResolution ? (
              <button
                type="button"
                onClick={() => void handleTriggerResolution()}
                disabled={isResolving}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:border-amber-300/35 hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <TimerReset className="h-4 w-4" />}
                Trigger Resolution
              </button>
            ) : null}

            {!wallet?.connected &&
            currentMarket.deadline < Date.now() &&
            currentMarket.status === 'Open' ? (
              <p className="mt-4 text-sm text-slate-400">
                Connect wallet to trigger resolution once the deadline passes.
              </p>
            ) : null}

            {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
                <BadgeInfo className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold text-white">Pool Breakdown</h2>
                <p className="text-sm text-slate-400">
                  Implied probabilities update directly from the seeded liquidity pools.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <OutcomeBar
                outcomes={currentMarket.outcome_labels}
                pools={currentMarket.outcome_pools}
                totalPool={currentMarket.total_pool}
              />
            </div>
          </section>

          <ResolutionSources market={currentMarket} resolutionLog={resolutionLog} />

          {currentMarket.status === 'Resolving' ||
          currentMarket.status === 'Resolved' ||
          currentMarket.status === 'Disputed' ? (
            <ResolutionConsole logLines={resolutionLog} />
          ) : null}
        </div>

        <div className="xl:sticky xl:top-28 xl:self-start">
          <BetPanel market={currentMarket} />
        </div>
      </section>
    </div>
  )
}
