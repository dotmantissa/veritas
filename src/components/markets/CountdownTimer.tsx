'use client'

import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'

import { formatDeadline } from '@/lib/utils'

export function CountdownTimer({ deadline }: { deadline: number }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 1_000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  const label = formatDeadline(Math.max(deadline, now))
  const isUrgent = deadline > now && deadline - now <= 60_000
  const expired = deadline <= now

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] ${
        expired
          ? 'border-status-disputed/30 bg-status-disputed/10 text-status-disputed'
          : isUrgent
            ? 'border-status-resolving/30 bg-status-resolving/10 text-status-resolving countdown-urgent'
            : 'border-border bg-bg-surface/60 text-text-secondary'
      }`}
    >
      <Clock3 className="h-3 w-3" />
      {expired ? 'Expired' : `Closes in ${label}`}
    </span>
  )
}
