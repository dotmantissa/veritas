import type { MarketStatus } from '@/lib/types'

const statusColorMap: Record<MarketStatus, string> = {
  Open: 'bg-status-open text-status-open border-status-open/20',
  Resolving: 'bg-status-resolving text-status-resolving border-status-resolving/20',
  Resolved: 'bg-status-resolved text-status-resolved border-status-resolved/20',
  Disputed: 'bg-status-disputed text-status-disputed border-status-disputed/20',
  Cancelled: 'bg-status-cancelled text-status-cancelled border-status-cancelled/20',
}

export function StatusBadge({ status }: { status: MarketStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] ${statusColorMap[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}
