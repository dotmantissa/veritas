import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowUpRight, Clock3, Layers3, ShieldCheck } from 'lucide-react'

import type { Market } from '@/lib/types'
import { formatAddress, formatRIALO } from '@/lib/utils'

import { CountdownTimer } from './CountdownTimer'
import { MarketStatusBadge } from './MarketStatusBadge'
import { OutcomeBar } from './OutcomeBar'

export function MarketCard({ market }: { market: Market }) {
  return (
    <article className="group h-full rounded-[1.75rem] border border-white/10 bg-slate-900/75 p-5 shadow-xl shadow-slate-950/30 transition hover:-translate-y-1 hover:border-cyan-400/25">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <MarketStatusBadge status={market.status} />
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            {market.category}
          </span>
        </div>
        <Link
          href={`/markets/${market.id}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-400/40 hover:text-white"
          aria-label={`Open market ${market.question}`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <Link href={`/markets/${market.id}`} className="mt-5 block">
        <h3 className="text-xl font-semibold leading-tight text-white transition group-hover:text-cyan-100">
          {market.question}
        </h3>
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {market.status === 'Open' ? (
          <CountdownTimer deadline={market.deadline} />
        ) : (
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
            <Clock3 className="mr-2 h-3.5 w-3.5" />
            {market.resolution_detail
              ? `Resolved ${format(market.resolution_detail.resolved_at, 'MMM d, yyyy')}`
              : `Created ${format(market.created_at, 'MMM d, yyyy')}`}
          </span>
        )}
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
          <Layers3 className="mr-2 h-3.5 w-3.5" />
          {market.resolution_sources.length} sources
        </span>
      </div>

      <div className="mt-5">
        <OutcomeBar
          outcomes={market.outcome_labels}
          pools={market.outcome_pools}
          totalPool={market.total_pool}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Total Pool
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {formatRIALO(market.total_pool)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Consensus
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {market.consensus_threshold}/{market.resolution_sources.length}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-slate-400">
        <span>Creator {formatAddress(market.creator)}</span>
        <span className="inline-flex items-center gap-2 text-slate-300">
          <ShieldCheck className="h-4 w-4 text-cyan-300" />
          Deterministic resolution
        </span>
      </div>
    </article>
  )
}
