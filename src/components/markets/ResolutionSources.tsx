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
    pending: 'border-border bg-bg-surface text-text-secondary',
    fetching: 'border-status-resolving/30 bg-accent-subtle text-accent',
    success: 'border-status-open/30 bg-status-open/10 text-status-open',
    error: 'border-status-disputed/30 bg-status-disputed/10 text-status-disputed',
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
  const outcomeClasses = [
    'bg-accent text-bg-base',
    'bg-accent-hot text-white',
    'bg-status-resolved text-white',
    'bg-status-open text-bg-base',
    'bg-status-resolving text-bg-base',
  ]

  return (
    <section className="rounded-xl border border-border bg-bg-card p-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-text-primary">
              How This Market <span className="text-accent">Resolves</span>
            </h2>
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary"
              title="These sources are locked into the market at creation. When the deadline passes, the contract reads all of them simultaneously. The outcome with the most agreement wins. No human can override this."
            >
              <Info className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-text-secondary">
            These sources are locked into the market at creation. When the deadline
            passes, the contract reads all of them simultaneously. The outcome
            with the most agreement wins.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-bg-surface px-4 py-3 text-sm text-text-primary">
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
              className="rounded-xl border border-border bg-bg-surface p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-text-primary">{source.label}</h3>
                    <StatusChip status={status} />
                  </div>
                  <div className="mt-3 flex min-w-0 items-center gap-2 text-sm text-text-secondary">
                    <span className="truncate">{source.url}</span>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-bg-card text-text-secondary transition hover:border-text-muted hover:text-text-primary"
                      aria-label={`Open source ${source.label}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <p className="mt-3 font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
                    checking {source.json_path}
                  </p>
                </div>

                {result ? (
                  <div className="grid gap-2 rounded-xl border border-border bg-bg-card px-4 py-3 text-sm text-text-secondary sm:grid-cols-3">
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

              <div className="mt-5 overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-[1.2fr,1fr] bg-bg-card px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  <span>API Return Value</span>
                  <span>Mapped Outcome</span>
                </div>
                {source.outcome_mappings.map((mapping, index) => (
                  <div
                    key={`${source.label}:${mapping}:${market.outcome_labels[index]}`}
                    className="grid grid-cols-[1.2fr,1fr] items-center gap-4 border-t border-border px-4 py-3 text-sm text-text-secondary"
                  >
                    <span>{mapping}</span>
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        outcomeClasses[index % outcomeClasses.length]
                      }`}
                    >
                      {market.outcome_labels[index]}
                    </span>
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
