'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { isToday } from 'date-fns'
import {
  ArrowRight,
  BrainCircuit,
  Clock3,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'

import { MarketCard } from '@/components/markets/MarketCard'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { StatCallout } from '@/components/ui/StatCallout'
import { useMarketStore } from '@/store/marketStore'

const featureCards = [
  {
    number: '01',
    icon: Zap,
    title: 'No Oracle Needed',
    body:
      'The contract reads the internet directly. No Chainlink, no Pyth, no reporters. Truth comes from source consensus.',
  },
  {
    number: '02',
    icon: BrainCircuit,
    title: 'Async Resolution',
    body:
      "Rialo's contracts sleep until deadline, wake, call every source simultaneously, and settle — all in a single async workflow.",
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'Multi-Source Consensus',
    body:
      '3–5 authoritative APIs must agree before any outcome is confirmed. Manipulation requires compromising all sources at once.',
  },
  {
    number: '04',
    icon: Clock3,
    title: '50ms Settlement',
    body:
      'Rialo block time means payouts arrive before you finish refreshing. Not minutes. Not hours. Seconds.',
  },
  {
    number: '05',
    icon: Sparkles,
    title: 'No Account Needed',
    body:
      "Rialo's account abstraction means login with email or phone. No seed phrases, no MetaMask, no friction.",
  },
] as const

const workflowSteps = [
  {
    number: '01',
    title: 'Define Your Prediction',
    body:
      'Write any yes/no or multi-outcome question. Set a deadline. Specify 3–5 API sources that will definitively answer it.',
  },
  {
    number: '02',
    title: 'The Crowd Decides',
    body:
      'Anyone stakes RIALO on the outcome they believe. Pool sizes shift in real-time, showing implied probability.',
  },
  {
    number: '03',
    title: 'Truth Resolves It',
    body:
      'At deadline, the contract fetches every source simultaneously. Consensus wins. Payouts are instant. No appeals.',
  },
] as const

export default function HomePage() {
  const markets = useMarketStore((state) => state.markets)

  const totalVolume = useMemo(
    () => markets.reduce((sum, market) => sum + market.total_pool, 0),
    [markets]
  )
  const resolvedToday = useMemo(
    () =>
      markets.filter(
        (market) =>
          market.resolution_detail &&
          isToday(market.resolution_detail.resolved_at)
      ).length,
    [markets]
  )
  const resolvedCount = useMemo(
    () => markets.filter((market) => market.status === 'Resolved').length,
    [markets]
  )
  const featuredMarkets = useMemo(
    () =>
      [...markets]
        .filter((market) => market.status === 'Open')
        .sort((left, right) => {
          const leftActivity = Math.max(left.created_at, left.deadline)
          const rightActivity = Math.max(right.created_at, right.deadline)
          return rightActivity - leftActivity
        })
        .slice(0, 3),
    [markets]
  )

  return (
    <div className="space-y-0">
      <section
        className="hero-noise fade-up relative overflow-hidden rounded-[20px] border border-border bg-bg-base px-6 py-14 sm:px-8 lg:min-h-[calc(100vh-9rem)] lg:px-10 lg:py-20"
        style={{ backgroundColor: 'var(--bg-base)' }}
      >
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="fade-up fade-up-delay-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary">
              <span className="text-accent-hot">◈</span>
              Powered by Rialo · Oracle-Free Resolution
            </span>

            <h1 className="mt-8 max-w-4xl font-display text-[clamp(56px,8vw,96px)] uppercase leading-[0.9] tracking-[0.08em] text-text-primary">
              Predict
              <br />
              With <span className="text-accent">Truth</span>
              <br />
              Not Trust
            </h1>

            <p className="mt-6 max-w-[420px] text-[15px] leading-7 text-text-secondary md:text-base">
              Prediction markets that self-resolve by reading the internet. No
              oracles. No reporters. No disputes. Ever.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <StatCallout
                value={String(markets.length)}
                label="Markets"
                className="fade-up fade-up-delay-2"
              />
              <StatCallout
                value={new Intl.NumberFormat('en-US').format(totalVolume)}
                unit="RIALO"
                label="Rialo Staked"
                className="fade-up fade-up-delay-3"
              />
              <StatCallout
                value={String(resolvedToday)}
                label="Resolved Today"
                className="fade-up fade-up-delay-4"
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/markets"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-hot px-7 py-3 text-sm font-semibold text-white transition duration-150 ease-out hover:scale-[1.02] hover:brightness-110 active:scale-[0.97]"
              >
                Browse Markets
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/markets/create"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-7 py-3 text-sm font-semibold text-text-primary transition duration-150 ease-out hover:border-text-muted hover:bg-bg-input active:scale-[0.97]"
              >
                Create Market
              </Link>
            </div>
          </div>

          <div className="fade-up fade-up-delay-2 relative mx-auto w-full max-w-[520px]">
            <div className="absolute -top-4 left-6 rounded-full border border-border bg-bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              58x Faster Resolution
            </div>
            <div className="absolute inset-4 rounded-2xl border border-border bg-bg-card opacity-40 [transform:rotate(2deg)]" />
            <div className="relative rounded-2xl border border-border bg-bg-card p-6 [transform:rotate(-2deg)] transition duration-200 ease-out hover:[transform:rotate(0deg)]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-status-open">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-open" />
                  Live
                </span>
                <span className="font-mono text-xs text-text-muted">
                  Market Preview
                </span>
              </div>

              <h3 className="mt-6 text-xl font-semibold leading-tight text-text-primary sm:text-2xl">
                Will BTC close above $120k by June 30, 2026?
              </h3>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-accent bg-accent-subtle px-4 py-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text-primary">
                    Yes
                  </p>
                  <p className="mt-2 font-display text-4xl uppercase tracking-[0.06em] text-accent">
                    68.3%
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-bg-surface px-4 py-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text-primary">
                    No
                  </p>
                  <p className="mt-2 font-display text-4xl uppercase tracking-[0.06em] text-accent-hot">
                    31.7%
                  </p>
                </div>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-bg-surface">
                <div className="h-full w-[68.3%] bg-accent transition-[width] duration-700 ease-out" />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {['CoinGecko ✓', 'Binance API ✓', 'CMC ✓'].map((source) => (
                  <span
                    key={source}
                    className="rounded-full border border-border bg-bg-base px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-text-secondary"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-t border-border bg-bg-surface px-6 py-6 sm:px-8 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCallout value={String(markets.length)} label="Total Markets Created" />
          <StatCallout
            value={new Intl.NumberFormat('en-US').format(totalVolume)}
            unit="RIALO"
            label="Total Rialo Staked"
          />
          <StatCallout value={String(resolvedCount)} label="Markets Resolved" />
          <StatCallout value="< 2" unit="s" label="Avg Resolution Time" />
        </div>
      </section>

      <section className="fade-up bg-bg-base px-6 py-16 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            title="LIVE MARKETS"
            accentWord="MARKETS"
            subtitle="Explore what the crowd believes. Hover to see resolution sources."
          />
          <Link
            href="/markets"
            className="text-sm text-text-secondary transition hover:text-text-primary"
          >
            View all markets
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {['All', 'Sports', 'Finance', 'Crypto', 'Weather', 'Politics'].map(
            (filter, index) => (
              <button
                key={filter}
                type="button"
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  index === 0
                    ? 'border-accent-hot bg-accent-hot text-white'
                    : 'border-border bg-bg-card text-text-secondary hover:border-text-muted hover:text-text-primary'
                }`}
              >
                {filter}
              </button>
            )
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {featuredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      </section>

      <section className="bg-bg-surface px-6 py-16 sm:px-8 lg:px-10">
        <SectionTitle
          title="BUILT DIFFERENT"
          accentWord="DIFFERENT"
          subtitle="Not another prediction market. Here's what sets Veritas apart."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {featureCards.map((feature, index) => {
            const Icon = feature.icon
            const centered = index >= 3

            return (
              <article
                key={feature.number}
                className={`relative overflow-hidden rounded-xl border border-border bg-bg-card p-7 transition duration-200 ease-out hover:border-text-muted hover:bg-bg-card-hover hover:shadow-[0_0_0_1px_var(--text-muted)] ${
                  centered ? 'lg:col-span-1' : ''
                } ${index === 3 ? 'lg:col-start-1 xl:col-start-1' : ''} ${
                  index === 4 ? 'lg:col-start-2 xl:col-start-2' : ''
                }`}
              >
                <span className="feature-number">{feature.number}</span>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-bg-surface text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-[20px] font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">
                  {feature.body}
                </p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="bg-bg-base px-6 py-16 sm:px-8 lg:px-10">
        <SectionTitle title="HOW IT WORKS" accentWord="WORKS" />

        <div className="relative mt-10">
          <div className="steps-connector absolute left-[16.66%] right-[16.66%] top-6 hidden border-t border-dashed border-border lg:block" />
          <div className="grid gap-8 lg:grid-cols-3">
            {workflowSteps.map((step) => (
              <article key={step.number} className="relative rounded-xl bg-transparent">
                <p className="font-display text-5xl uppercase tracking-[0.08em] text-accent">
                  {step.number}
                </p>
                <h3 className="mt-5 text-xl font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-text-secondary">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
