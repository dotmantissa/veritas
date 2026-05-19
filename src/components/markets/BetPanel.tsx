'use client'

import { useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { FEE_BPS, MIN_BET } from '@/lib/constants'
import { placeBet } from '@/lib/mock/contract'
import type { Market } from '@/lib/types'
import { calcPotentialPayout, formatRIALO } from '@/lib/utils'
import { useWalletStore } from '@/store/walletStore'

const quickAmounts = [25, 50, 100, 500]

export function BetPanel({ market }: { market: Market }) {
  const wallet = useWalletStore((state) => state.wallet)
  const [selectedOutcome, setSelectedOutcome] = useState(0)
  const [amount, setAmount] = useState<string>('100')
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const numericAmount = Number(amount)

  const previewPayout = useMemo(() => {
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return 0
    }

    return calcPotentialPayout(
      numericAmount,
      market.outcome_pools[selectedOutcome] ?? 0,
      market.total_pool,
      FEE_BPS
    )
  }, [market.outcome_pools, market.total_pool, numericAmount, selectedOutcome])

  const returnMultiple =
    numericAmount > 0 && Number.isFinite(numericAmount)
      ? previewPayout / numericAmount
      : 0

  async function handleSubmit(): Promise<void> {
    if (!wallet || !wallet.connected) {
      setError('Connect wallet to place a bet.')
      return
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter a valid amount.')
      return
    }

    if (numericAmount < MIN_BET) {
      setError(`Minimum bet is ${MIN_BET} RIALO.`)
      return
    }

    if (wallet.balance < numericAmount) {
      setError('Insufficient balance.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await placeBet(wallet, market.id, selectedOutcome, numericAmount)
      setAmount('100')
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to place bet.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (market.status !== 'Open') {
    return null
  }

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-base/95 p-4 backdrop-blur lg:static lg:z-auto lg:rounded-xl lg:border lg:bg-bg-card lg:p-6">
      <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-text-primary">
        Place Your Bet
      </h2>
      <p className="mt-2 text-sm leading-7 text-text-secondary">
        Choose an outcome, size your position, and submit a simulated Rialo
        transaction with confirmation timing and persistent state.
      </p>

      {wallet && wallet.connected ? (
        <p className="mt-5 rounded-xl border border-border bg-bg-surface px-4 py-3 text-sm text-text-primary">
          Available: {formatRIALO(wallet.balance)}
        </p>
      ) : (
        <p className="mt-5 rounded-xl border border-border bg-bg-surface px-4 py-3 text-sm text-text-secondary">
          Wallet not connected.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        {market.outcome_labels.map((outcome, index) => (
          <button
            key={outcome}
            type="button"
            onClick={() => setSelectedOutcome(index)}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              selectedOutcome === index
                ? 'border-accent bg-accent-subtle text-text-primary'
                : 'border-border bg-bg-surface text-text-secondary hover:border-text-muted hover:text-text-primary'
            }`}
          >
            <span className="block text-sm font-semibold">{outcome}</span>
            <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
              {market.total_pool > 0
                ? `${(((market.outcome_pools[index] ?? 0) / market.total_pool) * 100).toFixed(1)}%`
                : '0.0%'}
            </span>
          </button>
        ))}
      </div>

      <label className="mt-6 block">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          Stake Amount
        </span>
        <div className="flex items-center rounded-xl border border-border bg-bg-input px-4 py-3">
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            className="w-full border-0 bg-transparent p-0 text-right font-mono text-2xl text-text-primary shadow-none outline-none ring-0"
            placeholder="100"
          />
          <span className="ml-3 text-sm text-text-muted">RIALO</span>
        </div>
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickAmounts.map((quickAmount) => (
          <button
            key={quickAmount}
            type="button"
            onClick={() => setAmount(String(quickAmount))}
            className="rounded-full border border-border bg-bg-surface px-3 py-1.5 text-sm text-text-secondary transition hover:border-text-muted hover:text-text-primary"
          >
            {quickAmount}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setAmount(String(wallet?.balance ?? 0))}
          className="rounded-full border border-border bg-bg-surface px-3 py-1.5 text-sm text-text-secondary transition hover:border-text-muted hover:text-text-primary"
        >
          MAX
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-border-subtle bg-bg-surface p-4">
        <p className="text-sm text-text-secondary">
          If{' '}
          <span className="font-semibold text-text-primary">
            {market.outcome_labels[selectedOutcome]}
          </span>{' '}
          wins
        </p>
        <p className="mt-2 font-display text-4xl uppercase tracking-[0.06em] text-accent">
          {formatRIALO(previewPayout)}
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-muted">
          {returnMultiple > 0 ? `${returnMultiple.toFixed(1)}x return` : '0.0x return'}
        </p>
      </div>

      {error ? <p className="mt-4 text-sm text-status-disputed">{error}</p> : null}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={!wallet?.connected || isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-display text-2xl uppercase tracking-[0.08em] text-bg-base transition duration-150 ease-out hover:scale-[1.02] hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:border disabled:border-dashed disabled:border-border disabled:bg-bg-surface disabled:text-text-muted disabled:hover:scale-100 disabled:hover:brightness-100"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Place Bet →
      </button>

      <p className="mt-4 text-center text-[11px] uppercase tracking-[0.16em] text-text-muted">
        {FEE_BPS / 100}% protocol fee · ~0.000005 RIALO gas
      </p>
    </aside>
  )
}
