'use client'

import Link from 'next/link'
import { isToday } from 'date-fns'
import {
  ArrowRight,
  BadgeDollarSign,
  BrainCircuit,
  CandlestickChart,
  Globe2,
} from 'lucide-react'

import { MarketCard } from '@/components/markets/MarketCard'
import { useMarketStore } from '@/store/marketStore'

const steps = [
  {
    title: 'Create a market with a question and resolution sources',
    description:
      'Define the question, outcomes, and the APIs that will determine the final answer.',
    icon: Globe2,
  },
  {
    title: 'Anyone bets on an outcome',
    description:
      'Users take positions into the shared pool, shifting probability in real time.',
    icon: BadgeDollarSign,
  },
  {
    title: 'At deadline, the contract reads all sources and finds consensus',
    description:
      'Veritas compares the locked sources, tallies agreement, and settles deterministically.',
    icon: BrainCircuit,
  },
  {
    title: 'Winners are paid instantly. No appeals, no reporters, no waiting.',
    description:
      'Once consensus lands, the payout path becomes mechanical instead of political.',
    icon: CandlestickChart,
  },
] as const

export default function HomePage() {
  const markets = useMarketStore((state) => state.markets)

  const totalVolume = markets.reduce((sum, market) => sum + market.total_pool, 0)
  const resolvedToday = markets.filter(
    (market) => market.resolution_detail && isToday(market.resolution_detail.resolved_at)
  ).length
  const featuredMarkets = [...markets]
    .filter((market) => market.status === 'Open')
    .sort((left, right) => {
      const leftActivity = Math.max(left.created_at, left.deadline)
      const rightActivity = Math.max(right.created_at, right.deadline)
      return rightActivity - leftActivity
    })
    .slice(0, 3)

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.96))] p-8 shadow-2xl shadow-slate-950/40 sm:p-10">
        <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Rialo Testnet Simulation
        </span>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          Veritas. Truth from consensus, not gatekeepers.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
          Prediction markets that self-resolve by reading the internet. No
          oracles. No reporters. No disputes.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/markets"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Browse Markets
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/markets/create"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/35 hover:bg-cyan-400/10"
          >
            Create a Market
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Total Markets
          </p>
          <p className="mt-3 text-4xl font-semibold text-white">{markets.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Total Volume
          </p>
          <p className="mt-3 text-4xl font-semibold text-white">
            {new Intl.NumberFormat('en-US').format(totalVolume)} RIALO
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Markets Resolved Today
          </p>
          <p className="mt-3 text-4xl font-semibold text-white">{resolvedToday}</p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">
              Featured Markets
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Most recently active open markets
            </h2>
          </div>
          <Link href="/markets" className="text-sm text-cyan-200 hover:text-cyan-100">
            View all markets
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {featuredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">
            How It Works
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            Four deterministic steps from question to payout
          </h2>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <div
                key={step.title}
                className="rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-6"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
