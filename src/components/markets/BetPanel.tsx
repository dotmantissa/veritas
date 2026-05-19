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
    <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/20">
      <h2 className="text-2xl font-semibold text-white">Place a Bet</h2>
      <p className="mt-2 text-sm leading-7 text-slate-300">
        Choose an outcome, size your position, and submit a simulated Rialo
        transaction with confirmation timing and persistent state.
      </p>

      {wallet && wallet.connected ? (
        <p className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          Available: {formatRIALO(wallet.balance)}
        </p>
      ) : (
        <p className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Wallet not connected.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {market.outcome_labels.map((outcome, index) => (
          <button
            key={outcome}
            type="button"
            onClick={() => setSelectedOutcome(index)}
            className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
              selectedOutcome === index
                ? 'border-cyan-300 bg-cyan-300 text-slate-950'
                : 'border-white/10 bg-slate-950/40 text-slate-200 hover:border-cyan-400/30 hover:text-white'
            }`}
          >
            {outcome}
          </button>
        ))}
      </div>

      <label className="mt-6 block">
        <span className="mb-2 block text-sm font-medium text-slate-200">Amount</span>
        <div className="flex items-center rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            className="w-full bg-transparent text-base text-white outline-none"
            placeholder="100"
          />
          <span className="text-sm text-slate-400">RIALO</span>
        </div>
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickAmounts.map((quickAmount) => (
          <button
            key={quickAmount}
            type="button"
            onClick={() => setAmount(String(quickAmount))}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 transition hover:border-cyan-400/30 hover:text-white"
          >
            {quickAmount}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
        <p className="text-sm text-slate-300">
          If <span className="font-semibold text-white">{market.outcome_labels[selectedOutcome]}</span>{' '}
          wins: you receive approximately{' '}
          <span className="font-semibold text-white">{formatRIALO(previewPayout)}</span>
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Based on current pool share and a 2% protocol fee.
        </p>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={!wallet?.connected || isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Place Bet
      </button>
    </aside>
  )
}
