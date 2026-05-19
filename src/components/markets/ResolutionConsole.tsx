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

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#050816] p-6 shadow-2xl shadow-black/30">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
          <TerminalSquare className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-white">Resolution Console</h2>
          <p className="text-sm text-slate-400">
            Live log replay of the Rialo async source consensus flow.
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="mt-5 max-h-[26rem] overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-sm leading-7 text-emerald-200"
      >
        {logLines.length > 0 ? (
          logLines.map((line, index) => (
            <p key={`${line}-${index}`} className="whitespace-pre-wrap break-words">
              {line}
            </p>
          ))
        ) : (
          <p className="text-slate-500">
            Resolution has not started yet. Once triggered, each source fetch and
            consensus step will appear here in sequence.
          </p>
        )}
      </div>
    </section>
  )
}
