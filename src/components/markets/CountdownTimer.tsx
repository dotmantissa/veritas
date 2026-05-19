'use client'

import { useEffect, useState } from 'react'

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

  return (
    <span
      className={`inline-flex items-center rounded-full border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-text-secondary ${
        isUrgent ? 'countdown-urgent' : ''
      }`}
    >
      {deadline <= now ? 'Expired' : `Closes in ${label}`}
    </span>
  )
}
