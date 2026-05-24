'use client'

import { useEffect, useRef } from 'react'
import { TerminalSquare } from 'lucide-react'

export function ResolutionConsole({
  logLines,
}: {
  logLines: string[]
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = containerRef.current

    if (!node) {
      return
    }

    node.scrollTop = node.scrollHeight
  }, [logLines])

  function getLineClass(line: string): string {
    if (line.includes('Consensus failed') || line.includes('timeout') || line.includes('error')) {
      return 'text-accent-hot'
    }

    if (line.includes('Consensus reached') || line.includes('Market resolved') || line.includes('✓')) {
      return 'text-status-open'
    }

    if (line.includes('[Block #')) {
      return 'text-accent'
    }

    return 'text-text-secondary'
  }

  return (
    <section className="card-elevated rounded-xl p-6">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-bg-surface text-accent shadow-accent-glow">
            <TerminalSquare className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-2xl uppercase tracking-[0.08em] text-text-primary">
              Resolution <span className="accent-text-gradient">Console</span>
            </h2>
            <p className="text-sm text-text-secondary">
              Live log replay of the Rialo async source consensus flow.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-accent-hot" />
          <span className="h-3 w-3 rounded-full bg-accent" />
          <span className="h-3 w-3 rounded-full bg-status-open" />
        </div>
      </div>

      <div
        ref={containerRef}
        className="mt-5 max-h-[26rem] overflow-y-auto rounded-xl border border-border bg-[#050505] p-4 font-mono text-sm leading-7 text-status-open shadow-[inset_0_2px_8px_rgba(0,0,0,0.45)]"
      >
        {logLines.length > 0 ? (
          logLines.map((line, index) => (
            <p
              key={`${line}-${index}`}
              className={`console-line whitespace-pre-wrap break-words ${getLineClass(line)}`}
            >
              {line}
            </p>
          ))
        ) : (
          <p className="text-text-muted">
            Resolution has not started yet. Once triggered, each source fetch and
            consensus step will appear here in sequence.
          </p>
        )}
      </div>
    </section>
  )
}
