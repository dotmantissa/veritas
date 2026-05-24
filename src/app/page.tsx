'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
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
import type { MarketCategory } from '@/lib/types'
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

const featureCategories: Array<'All' | MarketCategory> = [
  'All',
  'Sports',
  'Finance',
  'Crypto',
  'Weather',
  'Politics',
]

export default function HomePage() {
  const markets = useMarketStore((state) => state.markets)
  const [featuredFilter, setFeaturedFilter] = useState<'All' | MarketCategory>('All')

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
        .filter(
          (market) =>
            featuredFilter === 'All' || market.category === featuredFilter
        )
        .sort((left, right) => {
          const leftActivity = Math.max(left.created_at, left.deadline)
          const rightActivity = Math.max(right.created_at, right.deadline)
          return rightActivity - leftActivity
        })
        .slice(0, 3),
    [markets, featuredFilter]
  )

  return (
    <div className="space-y-0">
      <section
        className="hero-noise fade-up relative overflow-hidden rounded-[24px] border border-border bg-bg-base px-6 py-14 sm:px-8 lg:min-h-[calc(100vh-9rem)] lg:px-12 lg:py-20"
        style={{ backgroundColor: 'var(--bg-base)' }}
      >
        <span
          className="hero-glow-orb"
          aria-hidden="true"
          style={{
            top: '-80px',
            left: '-40px',
            background:
              'radial-gradient(circle, rgba(232, 197, 71, 0.32) 0%, transparent 70%)',
          }}
        />
        <span
          className="hero-glow-orb"
          aria-hidden="true"
          style={{
            bottom: '-100px',
            right: '-60px',
            animationDelay: '-7s',
            background:
              'radial-gradient(circle, rgba(255, 77, 109, 0.26) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="fade-up fade-up-delay-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-surface/60 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary backdrop-blur-xs">
              <span className="relative inline-flex h-1.5 w-1.5 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-accent-hot/40 motion-safe:animate-ping" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-accent-hot" />
              </span>
              Powered by Rialo · Oracle-Free Resolution
            </span>

            <h1 className="mt-8 max-w-4xl font-display text-[clamp(56px,8vw,108px)] uppercase leading-[0.88] tracking-[0.06em] text-text-primary">
              Predict
              <br />
              With <span className="accent-text-gradient">Truth</span>
              <br />
              Not Trust
            </h1>

            <p className="mt-7 max-w-[460px] text-[15px] leading-7 text-text-secondary md:text-base">
              Prediction markets that self-resolve by reading the internet. No
              oracles. No reporters. No disputes. Ever.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
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

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/markets"
                className="button-primary inline-flex items-center justify-center gap-2 rounded-lg bg-accent-hot px-7 py-3.5 text-sm font-semibold text-white"
              >
                Browse Markets
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/markets/create"
                className="button-secondary inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-7 py-3.5 text-sm font-semibold text-text-primary hover:border-border-strong hover:bg-bg-surface"
              >
                Create Market
              </Link>
            </div>
          </div>

          <div className="fade-up fade-up-delay-2 relative mx-auto w-full max-w-[520px]">
            <div className="absolute -top-4 left-6 z-10 rounded-full border border-border bg-bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent shadow-accent-glow">
              58× Faster Resolution
            </div>
            <div className="absolute inset-4 rounded-2xl border border-border bg-bg-card opacity-40 [transform:rotate(2deg)]" />
            <div className="relative rounded-2xl border border-border bg-bg-card p-6 [transform:rotate(-2deg)] shadow-card-elevated transition duration-300 ease-out hover:[transform:rotate(0deg)] hover:shadow-accent-glow">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-status-open/30 bg-status-open/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-status-open">
                  <span className="relative inline-flex h-2 w-2 items-center justify-center">
                    <span className="absolute inset-0 rounded-full bg-status-open/40 motion-safe:animate-ping" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-status-open" />
                  </span>
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
                <div className="rounded-xl border border-accent/60 bg-accent-subtle px-4 py-4 shadow-accent-glow">
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

              <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-bg-surface">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-soft via-accent to-[#ffb060] transition-[width] duration-700 ease-out"
                  style={{ width: '68.3%' }}
                />
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

      <section className="section-divider border-b border-border bg-bg-surface/60 px-6 py-7 backdrop-blur-sm sm:px-8 lg:px-10">
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

      <section className="fade-up bg-bg-base px-6 py-20 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            title="LIVE MARKETS"
            accentWord="MARKETS"
            subtitle="Explore what the crowd believes. Hover to see resolution sources."
          />
          <Link
            href="/markets"
            className="group inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-text-primary"
          >
            View all markets
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {featureCategories.map((filter) => {
            const active = featuredFilter === filter
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setFeaturedFilter(filter)}
                className={`rounded-full border px-4 py-2 text-sm transition-all duration-150 ${
                  active
                    ? 'border-accent-hot bg-accent-hot text-white shadow-hot-glow'
                    : 'border-border bg-bg-card text-text-secondary hover:-translate-y-0.5 hover:border-border-strong hover:text-text-primary'
                }`}
              >
                {filter}
              </button>
            )
          })}
        </div>

        {featuredMarkets.length > 0 ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featuredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-xl border border-dashed border-border bg-bg-card/60 px-6 py-14 text-center">
            <p className="text-lg font-semibold text-text-primary">
              No open {featuredFilter === 'All' ? '' : `${featuredFilter} `}markets yet.
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Try another category, or create the first one.
            </p>
          </div>
        )}
      </section>

      <section className="relative overflow-hidden bg-bg-surface/70 px-6 py-20 sm:px-8 lg:px-10">
        <div className="gradient-divider absolute inset-x-12 top-0" />
        <SectionTitle
          title="BUILT DIFFERENT"
          accentWord="DIFFERENT"
          subtitle="Not another prediction market. Here's what sets Veritas apart."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {featureCards.map((feature, index) => {
            const Icon = feature.icon
            const centered = index >= 3

            return (
              <article
                key={feature.number}
                className={`card-elevated card-interactive relative overflow-hidden rounded-xl p-7 ${
                  centered ? 'lg:col-span-1' : ''
                } ${index === 3 ? 'lg:col-start-1 xl:col-start-1' : ''} ${
                  index === 4 ? 'lg:col-start-2 xl:col-start-2' : ''
                }`}
              >
                <span className="feature-number">{feature.number}</span>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-border bg-bg-surface text-accent shadow-accent-glow">
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

      <section className="relative bg-bg-base px-6 py-20 sm:px-8 lg:px-10">
        <div className="gradient-divider absolute inset-x-12 top-0" />
        <SectionTitle title="HOW IT WORKS" accentWord="WORKS" />

        <div className="relative mt-12">
          <div className="steps-connector absolute left-[16.66%] right-[16.66%] top-7 hidden border-t border-dashed border-border lg:block" />
          <div className="grid gap-10 lg:grid-cols-3">
            {workflowSteps.map((step) => (
              <article
                key={step.number}
                className="relative rounded-xl bg-transparent"
              >
                <div className="relative mb-1 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-bg-surface text-accent shadow-accent-glow">
                  <span className="font-display text-xl uppercase tracking-[0.06em]">
                    {step.number}
                  </span>
                </div>
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

        <div className="mt-16 flex flex-col items-center gap-5 rounded-2xl border border-border bg-bg-card/60 p-10 text-center shadow-card-elevated">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-text-secondary">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Ready to predict?
          </span>
          <h3 className="font-display text-[clamp(32px,4vw,48px)] uppercase leading-tight tracking-[0.06em] text-text-primary">
            Stake on what you believe.
            <br />
            <span className="accent-text-gradient">Let truth settle the rest.</span>
          </h3>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/markets"
              className="button-primary inline-flex items-center justify-center gap-2 rounded-lg bg-accent-hot px-7 py-3.5 text-sm font-semibold text-white"
            >
              Browse Markets
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/markets/create"
              className="button-secondary inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-7 py-3.5 text-sm font-semibold text-text-primary hover:border-border-strong hover:bg-bg-surface"
            >
              Create Market
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
