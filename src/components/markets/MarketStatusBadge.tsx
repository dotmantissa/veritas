import type { MarketStatus } from '@/lib/types'

const badgeStyles: Record<MarketStatus, string> = {
  Open: 'text-status-open',
  Resolving: 'text-status-resolving',
  Resolved: 'text-status-resolved',
  Disputed: 'text-status-disputed',
  Cancelled: 'text-status-cancelled',
}

export function MarketStatusBadge({ status }: { status: MarketStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] ${badgeStyles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}
