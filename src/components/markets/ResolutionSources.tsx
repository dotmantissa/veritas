'use client'

import { ExternalLink, Info, Loader2 } from 'lucide-react'

import type { Market, SourceResult } from '@/lib/types'

type SourceVisualStatus = 'pending' | 'fetching' | 'success' | 'error'

interface ResolutionSourcesProps {
  market: Market
  resolutionLog: string[]
}

function getSourceResult(
  sourceLabel: string,
  sourceResults: SourceResult[] | undefined
): SourceResult | undefined {
  return sourceResults?.find((result) => result.source.label === sourceLabel)
}

function getSourceStatus(
  market: Market,
  sourceLabel: string,
  resolutionLog: string[],
  result?: SourceResult
): SourceVisualStatus {
  if (result) {
    return result.status === 'success' ? 'success' : 'error'
  }

  if (
    resolutionLog.some((line) => line.includes(`Fetching`) && line.includes(sourceLabel))
  ) {
    return 'fetching'
  }

  if (market.status === 'Resolving') {
    return 'pending'
  }

  return 'pending'
}

function StatusChip({ status }: { status: SourceVisualStatus }) {
  const classes: Record<SourceVisualStatus, string> = {
    pending: 'border-white/10 bg-white/5 text-slate-300',
    fetching: 'border-amber-400/25 bg-amber-400/10 text-amber-100',
    success: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
    error: 'border-rose-400/25 bg-rose-400/10 text-rose-100',
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${classes[status]}`}
    >
      {status === 'fetching' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {status}
    </span>
  )
}

export function ResolutionSources({
  market,
  resolutionLog,
}: ResolutionSourcesProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/20">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-white">
              How this market resolves
            </h2>
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300"
              title="These sources are locked into the market at creation. When the deadline passes, the contract reads all of them simultaneously. The outcome with the most agreement wins. No human can override this."
            >
              <Info className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
            These sources are locked into the market at creation. When the deadline
            passes, the contract reads all of them simultaneously. The outcome
            with the most agreement wins.
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          Requires {market.consensus_threshold} of{' '}
          {market.resolution_sources.length} sources to agree
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {market.resolution_sources.map((source) => {
          const result = getSourceResult(
            source.label,
            market.resolution_detail?.source_results
          )
          const status = getSourceStatus(market, source.label, resolutionLog, result)

          return (
            <article
              key={`${market.id}:${source.label}`}
              className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{source.label}</h3>
                    <StatusChip status={status} />
                  </div>
                  <div className="mt-3 flex min-w-0 items-center gap-2 text-sm text-slate-300">
                    <span className="truncate">{source.url}</span>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-400/35 hover:text-white"
                      aria-label={`Open source ${source.label}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">
                    JSON path checked: <span className="text-slate-200">{source.json_path}</span>
                  </p>
                </div>

                {result ? (
                  <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 sm:grid-cols-3">
                    <span>Raw: {result.raw_value}</span>
                    <span>
                      Parsed:{' '}
                      {result.parsed_outcome === null
                        ? 'Unmapped'
                        : market.outcome_labels[result.parsed_outcome]}
                    </span>
                    <span>{result.latency_ms}ms</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
                <div className="grid grid-cols-[1.2fr,1fr] bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <span>API Return Value</span>
                  <span>Mapped Outcome</span>
                </div>
                {source.outcome_mappings.map((mapping, index) => (
                  <div
                    key={`${source.label}:${mapping}:${market.outcome_labels[index]}`}
                    className="grid grid-cols-[1.2fr,1fr] border-t border-white/10 px-4 py-3 text-sm text-slate-300"
                  >
                    <span>{mapping}</span>
                    <span>{market.outcome_labels[index]}</span>
                  </div>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
