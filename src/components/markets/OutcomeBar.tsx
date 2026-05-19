import { calcImpliedProbability, formatRIALO } from '@/lib/utils'

interface OutcomeBarProps {
  outcomes: string[]
  pools: number[]
  totalPool: number
  variant?: 'compact' | 'detail'
}

const segmentColors = [
  'bg-accent',
  'bg-accent-hot',
  'bg-status-resolved',
  'bg-status-open',
  'bg-status-resolving',
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
        className={`flex overflow-hidden rounded-full bg-bg-surface ${
          isDetail ? 'h-8' : 'h-2'
        }`}
      >
        {outcomes.map((outcome, index) => {
          const pool = pools[index] ?? 0
          const width = totalPool > 0 ? (pool / totalPool) * 100 : 0

          return (
            <div
              key={outcome}
              className={`h-full transition-[width] duration-700 ease-out ${segmentColors[index % segmentColors.length]}`}
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
                ? 'rounded-xl border border-border bg-bg-card px-4 py-3'
                : ''
            }`}
          >
            <div className="min-w-0">
              <p
                className={`truncate font-semibold text-text-primary ${
                  isDetail ? 'text-base' : 'text-sm'
                }`}
              >
                {outcome}
              </p>
              <p
                className={`mt-1 font-mono uppercase tracking-[0.12em] text-text-secondary ${
                  isDetail ? 'text-xs' : 'text-[11px]'
                }`}
              >
                {calcImpliedProbability(pools[index] ?? 0, totalPool)}
              </p>
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
