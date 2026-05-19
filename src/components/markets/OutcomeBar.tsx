import { calcImpliedProbability, formatRIALO } from '@/lib/utils'

interface OutcomeBarProps {
  outcomes: string[]
  pools: number[]
  totalPool: number
}

const segmentColors = [
  'from-cyan-300 to-sky-500',
  'from-emerald-300 to-teal-500',
  'from-amber-300 to-orange-500',
  'from-fuchsia-300 to-pink-500',
  'from-violet-300 to-indigo-500',
]

export function OutcomeBar({
  outcomes,
  pools,
  totalPool,
}: OutcomeBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex h-3 overflow-hidden rounded-full bg-white/10">
        {outcomes.map((outcome, index) => {
          const pool = pools[index] ?? 0
          const width = totalPool > 0 ? (pool / totalPool) * 100 : 0

          return (
            <div
              key={outcome}
              className={`h-full bg-gradient-to-r ${segmentColors[index % segmentColors.length]}`}
              style={{ width: `${width}%` }}
            />
          )
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {outcomes.map((outcome, index) => (
          <div
            key={outcome}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <p className="text-sm font-medium text-white">{outcome}</p>
            <p className="mt-1 text-sm text-slate-300">
              {calcImpliedProbability(pools[index] ?? 0, totalPool)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {formatRIALO(pools[index] ?? 0)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
