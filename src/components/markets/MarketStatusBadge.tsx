import type { MarketStatus } from '@/lib/types'

const badgeStyles: Record<MarketStatus, string> = {
  Open: 'text-status-open border-status-open/30 bg-status-open/8',
  Resolving: 'text-status-resolving border-status-resolving/30 bg-status-resolving/8',
  Resolved: 'text-status-resolved border-status-resolved/30 bg-status-resolved/8',
  Disputed: 'text-status-disputed border-status-disputed/30 bg-status-disputed/8',
  Cancelled: 'text-status-cancelled border-status-cancelled/30 bg-status-cancelled/8',
}

export function MarketStatusBadge({ status }: { status: MarketStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.16em] ${badgeStyles[status]}`}
    >
      <span className="relative inline-flex h-2 w-2 items-center justify-center">
        {status === 'Open' ? (
          <span className="absolute inset-0 rounded-full bg-current opacity-40 motion-safe:animate-ping" />
        ) : null}
        <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {status}
    </span>
  )
}
