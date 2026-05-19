import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Markets — Veritas',
}

export default function MarketsLayout({ children }: { children: ReactNode }) {
  return children
}
