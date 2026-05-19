import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Market — Veritas',
}

export default function MarketDetailLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
