import type { MarketStatus } from '@/lib/types'

const badgeStyles: Record<MarketStatus, string> = {
  Open: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
  Resolving: 'border-amber-400/25 bg-amber-400/10 text-amber-100',
  Resolved: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-100',
  Disputed: 'border-rose-400/25 bg-rose-400/10 text-rose-100',
  Cancelled: 'border-slate-400/25 bg-slate-400/10 text-slate-200',
}

export function MarketStatusBadge({ status }: { status: MarketStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${badgeStyles[status]}`}
    >
      {status}
    </span>
  )
}
