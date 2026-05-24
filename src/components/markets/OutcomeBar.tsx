import { calcImpliedProbability, formatRIALO } from '@/lib/utils'

interface OutcomeBarProps {
  outcomes: string[]
  pools: number[]
  totalPool: number
  variant?: 'compact' | 'detail'
}

const segmentColors = [
  'bg-gradient-to-r from-accent-soft via-accent to-[#ffb060]',
  'bg-gradient-to-r from-accent-hot-soft via-accent-hot to-[#ff3a5b]',
  'bg-gradient-to-r from-[#84b9fb] via-status-resolved to-[#3b82f6]',
  'bg-gradient-to-r from-[#6ee896] via-status-open to-[#22c55e]',
  'bg-gradient-to-r from-[#f5d97a] via-status-resolving to-[#d4a012]',
]

const segmentDots = [
  'bg-accent',
  'bg-accent-hot',
  'bg-status-resolved',
  'bg-status-open',
  'bg-status-resolving',
]

const segmentText = [
  'text-accent',
  'text-accent-hot',
  'text-status-resolved',
  'text-status-open',
  'text-status-resolving',
]

export function OutcomeBar({
  outcomes,
  pools,
  totalPool,
  variant = 'compact',
}: OutcomeBarProps) {
  const isDetail = variant === 'detail'

  return (
    <div className={isDetail ? 'space-y-5' : 'space-y-3'}>
      <div
        className={`flex overflow-hidden rounded-full bg-bg-surface ring-1 ring-border ${
          isDetail ? 'h-8' : 'h-2'
        }`}
      >
        {outcomes.map((outcome, index) => {
          const pool = pools[index] ?? 0
          const width = totalPool > 0 ? (pool / totalPool) * 100 : 0

          return (
            <div
              key={outcome}
              className={`h-full transition-[width] duration-700 ease-out ${segmentColors[index % segmentColors.length]} ${
                index > 0 ? 'border-l border-bg-base/40' : ''
              }`}
              style={{ width: `${width}%` }}
            />
          )
        })}
      </div>

      <div className={isDetail ? 'space-y-3' : 'space-y-2'}>
        {outcomes.map((outcome, index) => (
          <div
            key={outcome}
            className={`flex items-center justify-between gap-3 ${
              isDetail
                ? 'rounded-xl border border-border bg-bg-card px-4 py-3 transition hover:border-border-strong'
                : ''
            }`}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  segmentDots[index % segmentDots.length]
                }`}
              />
              <div className="min-w-0">
                <p
                  className={`truncate font-semibold text-text-primary ${
                    isDetail ? 'text-base' : 'text-sm'
                  }`}
                >
                  {outcome}
                </p>
                <p
                  className={`mt-1 font-mono uppercase tracking-[0.12em] ${
                    segmentText[index % segmentText.length]
                  } ${isDetail ? 'text-xs' : 'text-[11px]'}`}
                >
                  {calcImpliedProbability(pools[index] ?? 0, totalPool)}
                </p>
              </div>
            </div>
            <p
              className={`shrink-0 font-mono ${
                isDetail ? 'text-sm text-text-primary' : 'text-xs text-text-muted'
              }`}
            >
              {formatRIALO(pools[index] ?? 0)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
