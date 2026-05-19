import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Create Market — Veritas',
}

export default function CreateMarketLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
