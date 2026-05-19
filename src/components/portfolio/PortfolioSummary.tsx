import { TrendingDown, TrendingUp, WalletCards } from 'lucide-react'

import { formatRIALO } from '@/lib/utils'

interface PortfolioSummaryProps {
  totalStaked: number
  totalClaimed: number
  unrealizedValue: number
  pnl: number
}

export function PortfolioSummary({
  totalStaked,
  totalClaimed,
  unrealizedValue,
  pnl,
}: PortfolioSummaryProps) {
  const isPositive = pnl >= 0

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
          <WalletCards className="h-5 w-5" />
        </span>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
          Total Staked
        </p>
        <p className="mt-2 text-3xl font-semibold text-white">
          {formatRIALO(totalStaked)}
        </p>
      </article>

      <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-200">
          <TrendingUp className="h-5 w-5" />
        </span>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
          Total Claimed
        </p>
        <p className="mt-2 text-3xl font-semibold text-white">
          {formatRIALO(totalClaimed)}
        </p>
      </article>

      <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-200">
          <WalletCards className="h-5 w-5" />
        </span>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
          Unrealised Value
        </p>
        <p className="mt-2 text-3xl font-semibold text-white">
          {formatRIALO(unrealizedValue)}
        </p>
      </article>

      <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
            isPositive
              ? 'bg-emerald-400/10 text-emerald-200'
              : 'bg-rose-400/10 text-rose-200'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-5 w-5" />
          ) : (
            <TrendingDown className="h-5 w-5" />
          )}
        </span>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">P&amp;L</p>
        <p
          className={`mt-2 text-3xl font-semibold ${
            isPositive ? 'text-emerald-200' : 'text-rose-200'
          }`}
        >
          {isPositive ? '+' : ''}
          {formatRIALO(pnl)}
        </p>
      </article>
    </section>
  )
}
