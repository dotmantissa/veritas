'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
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
  const creatorInitials = currentMarket.creator.slice(0, 2).toUpperCase()

  const canTriggerResolution =
    currentMarket.status === 'Open' &&
    currentMarket.deadline < Date.now() &&
    wallet?.connected

  useEffect(() => {
    const previousTitle = document.title
    const trimmedQuestion =
      currentMarket.question.length > 60
        ? `${currentMarket.question.slice(0, 60)}...`
        : currentMarket.question

    document.title = `${trimmedQuestion} — Veritas`

    return () => {
      document.title = previousTitle
    }
  }, [currentMarket.question])

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
    <div className={`space-y-8 ${currentMarket.status === 'Open' ? 'pb-80 lg:pb-0' : ''}`}>
      <section className="rounded-xl border border-border bg-bg-card p-6 sm:p-8 fade-up">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <Link
              href="/markets"
              className="inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to markets
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-border bg-bg-surface px-3 py-1 text-xs font-medium text-text-secondary">
                {currentMarket.category}
              </span>
              <MarketStatusBadge status={market.status} />
              {currentMarket.status === 'Open' ? (
                <CountdownTimer deadline={currentMarket.deadline} />
              ) : currentMarket.resolution_detail ? (
                <span className="rounded-full border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-text-secondary">
                  Resolved {format(currentMarket.resolution_detail.resolved_at, 'MMM d · h:mm a')}
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 font-display text-[clamp(2.25rem,6vw,3.75rem)] uppercase leading-none tracking-[0.04em] text-text-primary">
              {currentMarket.question}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-surface font-mono text-xs text-text-primary">
                {creatorInitials}
              </span>
              <span>Created by {formatAddress(currentMarket.creator)}</span>
              <span>{format(currentMarket.created_at, 'MMM d, yyyy · h:mm a')}</span>
            </div>

            {currentMarket.status === 'Resolved' &&
            currentMarket.resolved_outcome !== null ? (
              <p className="mt-5 inline-flex items-center gap-2 rounded-xl border border-status-open/30 bg-status-open/10 px-4 py-3 text-sm text-status-open">
                <ShieldCheck className="h-4 w-4" />
                Winning outcome:{' '}
                {currentMarket.outcome_labels[currentMarket.resolved_outcome]}
              </p>
            ) : null}

            {currentMarket.status === 'Disputed' ? (
              <p className="mt-5 inline-flex items-center gap-2 rounded-xl border border-status-disputed/30 bg-status-disputed/10 px-4 py-3 text-sm text-status-disputed">
                <TriangleAlert className="h-4 w-4" />
                Consensus failed. Positions can be refunded.
              </p>
            ) : null}
          </div>

          <div className="w-full max-w-sm rounded-xl border border-border bg-bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
              Total Pool
            </p>
            <p className="mt-3 font-display text-5xl uppercase tracking-[0.05em] text-accent">
              {formatRIALO(currentMarket.total_pool)}
            </p>
            <p className="mt-5 text-sm text-text-secondary">
              Consensus threshold: {currentMarket.consensus_threshold}/
              {currentMarket.resolution_sources.length}
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Protocol fee: 0.000005 RIALO gas, 2% settlement fee
            </p>

            {canTriggerResolution ? (
              <button
                type="button"
                onClick={() => void handleTriggerResolution()}
                disabled={isResolving}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-accent bg-accent-subtle px-4 py-3 text-sm font-semibold text-accent transition hover:border-text-primary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <TimerReset className="h-4 w-4" />}
                Trigger Resolution
              </button>
            ) : null}

            {!wallet?.connected &&
            currentMarket.deadline < Date.now() &&
            currentMarket.status === 'Open' ? (
              <p className="mt-4 text-sm text-text-muted">
                Connect wallet to trigger resolution once the deadline passes.
              </p>
            ) : null}

            {error ? <p className="mt-4 text-sm text-status-disputed">{error}</p> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-8">
          <section className="rounded-xl border border-border bg-bg-card p-6 fade-up fade-up-delay-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-bg-surface text-accent">
                <BadgeInfo className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-text-primary">
                  Pool <span className="text-accent">Breakdown</span>
                </h2>
                <p className="text-sm text-text-secondary">
                  Implied probabilities update directly from the seeded liquidity pools.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <OutcomeBar
                outcomes={currentMarket.outcome_labels}
                pools={currentMarket.outcome_pools}
                totalPool={currentMarket.total_pool}
                variant="detail"
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

        <div className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
          <BetPanel market={currentMarket} />
        </div>
      </section>

      <div className="lg:hidden">
        <BetPanel market={currentMarket} />
      </div>
    </div>
  )
}
