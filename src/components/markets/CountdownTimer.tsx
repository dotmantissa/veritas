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

  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
      {deadline <= now ? 'Expired' : `Closes in ${label}`}
    </span>
  )
}
