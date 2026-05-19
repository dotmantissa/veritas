'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react'

import {
  CONSENSUS_THRESHOLD_DEFAULT,
  DEADLINE_MIN_FUTURE_MS,
  FEE_BPS,
  MARKET_CATEGORIES,
  MAX_OUTCOMES,
  MAX_QUESTION_LENGTH,
  MAX_SOURCES,
  MIN_OUTCOMES,
  MIN_SOURCES,
} from '@/lib/constants'
import {
  previewSourceConfig,
  SOURCE_TEMPLATES,
} from '@/lib/mock/sources'
import { createMarket } from '@/lib/mock/contract'
import type { MarketCategory, SourceConfig } from '@/lib/types'
import { formatRIALO } from '@/lib/utils'
import { useWalletStore } from '@/store/walletStore'
import { SectionTitle } from '@/components/ui/SectionTitle'

type Step = 1 | 2 | 3 | 4

interface PreviewState {
  loading: boolean
  payload: string
  extracted: string | null
  adapter: string
  error: string
}

const stepLabels: Record<Step, string> = {
  1: 'The Question',
  2: 'Outcomes',
  3: 'Resolution Sources',
  4: 'Review & Deploy',
}

const defaultSource = (outcomeCount: number): SourceConfig => ({
  label: 'New Source',
  url: '',
  json_path: '$.',
  outcome_mappings: Array.from({ length: outcomeCount }, () => ''),
})

function toDatetimeLocalValue(timestamp: number): string {
  const local = new Date(timestamp - new Date().getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

function ensureSourceMappings(
  source: SourceConfig,
  outcomeCount: number
): SourceConfig {
  return {
    ...source,
    outcome_mappings: Array.from({ length: outcomeCount }, (_, index) => {
      return source.outcome_mappings[index] ?? ''
    }),
  }
}

export default function CreateMarketPage() {
  const router = useRouter()
  const wallet = useWalletStore((state) => state.wallet)
  const [step, setStep] = useState<Step>(1)
  const [question, setQuestion] = useState('')
  const [category, setCategory] = useState<MarketCategory>('Other')
  const [deadline, setDeadline] = useState(
    toDatetimeLocalValue(Date.now() + 10 * 60 * 1_000)
  )
  const [outcomes, setOutcomes] = useState<string[]>(['Yes', 'No'])
  const [sources, setSources] = useState<SourceConfig[]>([
    {
      label: 'OpenMeteo Daily Rain',
      url: 'https://api.open-meteo.com/v1/forecast?latitude=6.52&longitude=3.37&daily=rain_sum&timezone=Africa%2FLagos',
      json_path: '$.daily.rain_sum.0',
      outcome_mappings: ['1', '0'],
    },
    {
      label: 'OpenMeteo Hourly Precipitation',
      url: 'https://api.open-meteo.com/v1/forecast?latitude=6.52&longitude=3.37&hourly=precipitation_probability&timezone=Africa%2FLagos',
      json_path: '$.hourly.precipitation_probability.0',
      outcome_mappings: ['80', '10'],
    },
    {
      label: 'Weather Mirror',
      url: 'https://mock.veritas/weather/lagos-rain',
      json_path: '$.forecast',
      outcome_mappings: ['rain', 'clear'],
    },
  ])
  const [consensusThreshold, setConsensusThreshold] = useState(
    CONSENSUS_THRESHOLD_DEFAULT
  )
  const [stepError, setStepError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [previewByIndex, setPreviewByIndex] = useState<Record<number, PreviewState>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const deadlineMs = useMemo(() => {
    const parsed = new Date(deadline).getTime()
    return Number.isNaN(parsed) ? 0 : parsed
  }, [deadline])

  const estimatedFee = formatRIALO(FEE_BPS / 10_000)

  function updateOutcome(index: number, value: string): void {
    const nextOutcomes = [...outcomes]
    nextOutcomes[index] = value
    setOutcomes(nextOutcomes)
  }

  function syncSourcesToOutcomeCount(nextOutcomeCount: number): void {
    setSources((current) =>
      current.map((source) => ensureSourceMappings(source, nextOutcomeCount))
    )
  }

  function addOutcome(): void {
    if (outcomes.length >= MAX_OUTCOMES) {
      return
    }

    const nextOutcomes = [...outcomes, `Outcome ${outcomes.length + 1}`]
    setOutcomes(nextOutcomes)
    syncSourcesToOutcomeCount(nextOutcomes.length)
  }

  function removeOutcome(index: number): void {
    if (outcomes.length <= MIN_OUTCOMES) {
      return
    }

    const nextOutcomes = outcomes.filter((_, currentIndex) => currentIndex !== index)
    setOutcomes(nextOutcomes)
    syncSourcesToOutcomeCount(nextOutcomes.length)
    setSources((current) =>
      current.map((source) => ({
        ...source,
        outcome_mappings: source.outcome_mappings.filter(
          (_, currentIndex) => currentIndex !== index
        ),
      }))
    )
  }

  function updateSource(index: number, updates: Partial<SourceConfig>): void {
    setSources((current) =>
      current.map((source, currentIndex) =>
        currentIndex === index ? { ...source, ...updates } : source
      )
    )
  }

  function updateSourceMapping(
    sourceIndex: number,
    mappingIndex: number,
    value: string
  ): void {
    setSources((current) =>
      current.map((source, currentIndex) => {
        if (currentIndex !== sourceIndex) {
          return source
        }

        const nextMappings = [...source.outcome_mappings]
        nextMappings[mappingIndex] = value

        return {
          ...source,
          outcome_mappings: nextMappings,
        }
      })
    )
  }

  function addSource(): void {
    if (sources.length >= MAX_SOURCES) {
      return
    }

    setSources((current) => [...current, defaultSource(outcomes.length)])
  }

  function removeSource(index: number): void {
    if (sources.length <= MIN_SOURCES) {
      return
    }

    setSources((current) => current.filter((_, currentIndex) => currentIndex !== index))
    setPreviewByIndex((current) => {
      const nextState: Record<number, PreviewState> = {}

      Object.entries(current).forEach(([key, value]) => {
        const numericKey = Number(key)

        if (numericKey < index) {
          nextState[numericKey] = value
        } else if (numericKey > index) {
          nextState[numericKey - 1] = value
        }
      })

      return nextState
    })
  }

  function applyTemplate(templateKey: keyof typeof SOURCE_TEMPLATES): void {
    const template = SOURCE_TEMPLATES[templateKey]

    setQuestion(template.question)
    setCategory(template.category as MarketCategory)
    setOutcomes(template.outcomes)
    setSources(
      template.sources.map((source) =>
        ensureSourceMappings(source, template.outcomes.length)
      )
    )
    setConsensusThreshold(Math.min(template.sources.length, CONSENSUS_THRESHOLD_DEFAULT))
    setPreviewByIndex({})
  }

  function validateStep(currentStep: Step): string {
    if (currentStep === 1) {
      if (question.trim().length === 0) {
        return 'Enter a market question.'
      }

      if (question.length > MAX_QUESTION_LENGTH) {
        return `Question must be ${MAX_QUESTION_LENGTH} characters or less.`
      }

      if (!deadlineMs || deadlineMs <= Date.now() + DEADLINE_MIN_FUTURE_MS) {
        return 'Deadline must be at least 5 minutes in the future.'
      }
    }

    if (currentStep === 2) {
      if (outcomes.length < MIN_OUTCOMES || outcomes.length > MAX_OUTCOMES) {
        return `Add between ${MIN_OUTCOMES} and ${MAX_OUTCOMES} outcomes.`
      }

      if (outcomes.some((outcome) => outcome.trim().length === 0)) {
        return 'Every outcome needs a label.'
      }
    }

    if (currentStep === 3) {
      if (sources.length < MIN_SOURCES || sources.length > MAX_SOURCES) {
        return `Add between ${MIN_SOURCES} and ${MAX_SOURCES} sources.`
      }

      for (const source of sources) {
        if (!source.label.trim()) {
          return 'Every source needs a label.'
        }
        if (!source.url.startsWith('https://')) {
          return 'Every source URL must start with https://.'
        }
        if (!source.json_path.startsWith('$.')) {
          return 'Every JSON path must start with `$.`.'
        }
        if (
          source.outcome_mappings.length !== outcomes.length ||
          source.outcome_mappings.some((mapping) => mapping.trim().length === 0)
        ) {
          return 'Every source must define a mapping for each outcome.'
        }
      }
    }

    return ''
  }

  function goNext(): void {
    const error = validateStep(step)

    if (error) {
      setStepError(error)
      return
    }

    setStepError('')
    setStep((current) => Math.min(4, current + 1) as Step)
  }

  function goBack(): void {
    setStepError('')
    setStep((current) => Math.max(1, current - 1) as Step)
  }

  async function handlePreviewSource(index: number): Promise<void> {
    const source = sources[index]

    setPreviewByIndex((current) => ({
      ...current,
      [index]: {
        loading: true,
        payload: '',
        extracted: null,
        adapter: '',
        error: '',
      },
    }))

    try {
      const preview = await previewSourceConfig(source)
      setPreviewByIndex((current) => ({
        ...current,
        [index]: {
          loading: false,
          payload: preview.payload,
          extracted: preview.extracted,
          adapter: preview.adapter,
          error: '',
        },
      }))
    } catch (error) {
      setPreviewByIndex((current) => ({
        ...current,
        [index]: {
          loading: false,
          payload: '',
          extracted: null,
          adapter: '',
          error: error instanceof Error ? error.message : 'Unable to test source.',
        },
      }))
    }
  }

  async function handleSubmit(): Promise<void> {
    const validationError =
      validateStep(1) || validateStep(2) || validateStep(3)

    if (validationError) {
      setStepError(validationError)
      setStep(1)
      return
    }

    if (!wallet || !wallet.connected) {
      setSubmitError('Connect wallet to continue.')
      return
    }

    setSubmitError('')
    setIsSubmitting(true)

    try {
      const { market } = await createMarket(wallet, {
        question: question.trim(),
        category,
        deadline: deadlineMs,
        outcome_labels: outcomes.map((outcome) => outcome.trim()),
        resolution_sources: sources.map((source) => ({
          ...source,
          label: source.label.trim(),
          url: source.url.trim(),
          json_path: source.json_path.trim(),
          outcome_mappings: source.outcome_mappings.map((mapping) => mapping.trim()),
        })),
        consensus_threshold: Math.min(consensusThreshold, sources.length),
      })

      router.push(`/markets/${market.id}`)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Unable to create market.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-bg-card p-8 fade-up">
        <SectionTitle
          title="Create A Market"
          accentWord="Market"
          subtitle="Define the question, lock the outcome set, wire the resolution sources, and deploy through the mock Rialo transaction flow."
        />
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-xl border border-border bg-bg-card p-6 xl:max-w-[720px]">
          <div className="grid gap-3 sm:grid-cols-4">
            {(Object.entries(stepLabels) as Array<[string, string]>).map(
              ([stepNumber, label]) => {
                const numericStep = Number(stepNumber) as Step
                const isActive = step === numericStep
                const isCompleted = step > numericStep

                return (
                  <div
                    key={label}
                    className={`rounded-xl border px-4 py-4 ${
                      isActive
                        ? 'border-accent bg-accent-subtle'
                        : 'border-border bg-bg-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          isCompleted
                            ? 'bg-status-open text-bg-base'
                            : isActive
                              ? 'bg-accent text-bg-base'
                              : 'border border-border bg-bg-card text-text-secondary'
                        }`}
                      >
                        {isCompleted ? <Check className="h-4 w-4" /> : numericStep}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isActive ? 'text-text-primary' : 'text-text-secondary'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  </div>
                )
              }
            )}
          </div>

          <div className="mt-8">
            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    Question
                  </label>
                  <textarea
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    maxLength={MAX_QUESTION_LENGTH}
                    rows={4}
                    className="w-full"
                    placeholder="Will it rain in Lagos tomorrow?"
                  />
                  <p className="mt-2 text-right text-sm text-text-muted">
                    {question.length}/{MAX_QUESTION_LENGTH}
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-text-primary">
                      Category
                    </span>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(event) =>
                          setCategory(event.target.value as MarketCategory)
                        }
                        className="w-full appearance-none"
                      >
                        {MARKET_CATEGORIES.map((entry) => (
                          <option key={entry} value={entry}>
                            {entry}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-text-primary">
                      Deadline
                    </span>
                    <input
                      type="datetime-local"
                      value={deadline}
                      onChange={(event) => setDeadline(event.target.value)}
                      className="w-full"
                    />
                    <p className="mt-2 text-sm text-text-muted">
                      Must be more than 5 minutes from now.
                    </p>
                  </label>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5">
                {outcomes.map((outcome, index) => (
                  <div
                    key={`${index}-${outcome}`}
                    className="flex gap-3 rounded-xl border border-border bg-bg-surface p-4"
                  >
                    <input
                      value={outcome}
                      onChange={(event) => updateOutcome(index, event.target.value)}
                      className="w-full border-0 bg-transparent p-0 text-base text-text-primary shadow-none outline-none ring-0"
                      placeholder={`Outcome ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeOutcome(index)}
                      disabled={outcomes.length <= MIN_OUTCOMES}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary transition hover:border-text-muted hover:text-status-disputed disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addOutcome}
                  disabled={outcomes.length >= MAX_OUTCOMES}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-surface px-4 py-2 text-sm text-text-secondary transition hover:border-text-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                  Add Outcome
                </button>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 rounded-xl border border-border bg-bg-surface p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      Source Templates
                    </h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      Prefill common Weather, Crypto, or Sports source sets.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(SOURCE_TEMPLATES) as Array<
                      keyof typeof SOURCE_TEMPLATES
                    >).map((templateKey) => (
                      <button
                        key={templateKey}
                        type="button"
                        onClick={() => applyTemplate(templateKey)}
                        className="rounded-full border border-border bg-bg-card px-4 py-2 text-sm text-text-secondary transition hover:border-text-muted hover:text-text-primary"
                      >
                        {templateKey}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-text-primary">
                    Consensus Threshold
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={sources.length}
                    value={consensusThreshold}
                    onChange={(event) =>
                      setConsensusThreshold(Number(event.target.value) || 1)
                    }
                    className="w-full"
                  />
                </label>

                {sources.map((source, sourceIndex) => {
                  const preview = previewByIndex[sourceIndex]

                  return (
                    <article
                      key={`${sourceIndex}-${source.label}`}
                      className="rounded-xl border border-border bg-bg-surface p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-card text-text-secondary">
                            ::
                          </span>
                          <h3 className="text-lg font-semibold text-text-primary">
                            Source {sourceIndex + 1}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSource(sourceIndex)}
                          disabled={sources.length <= MIN_SOURCES}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary transition hover:border-text-muted hover:text-status-disputed disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-5 grid gap-4">
                        <input
                          value={source.label}
                          onChange={(event) =>
                            updateSource(sourceIndex, { label: event.target.value })
                          }
                          className="w-full"
                          placeholder="Source label"
                        />
                        <input
                          value={source.url}
                          onChange={(event) =>
                            updateSource(sourceIndex, { url: event.target.value })
                          }
                          className="w-full"
                          placeholder="https://..."
                        />
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <label className="text-sm font-medium text-text-primary">
                              JSON path
                            </label>
                            <span
                              title="This is the path inside the source JSON payload that Veritas reads to determine the winning outcome."
                              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border text-xs text-text-muted"
                            >
                              ?
                            </span>
                          </div>
                          <input
                            value={source.json_path}
                            onChange={(event) =>
                              updateSource(sourceIndex, {
                                json_path: event.target.value,
                              })
                            }
                            className="w-full"
                            placeholder="$.data.winner"
                          />
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl border border-border-subtle bg-bg-card p-4">
                        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">
                          Outcome Mappings
                        </h4>
                        <div className="mt-4 grid gap-3">
                          {outcomes.map((outcome, mappingIndex) => (
                            <label
                              key={`${sourceIndex}-${mappingIndex}-${outcome}`}
                              className="grid gap-2 md:grid-cols-[160px_minmax(0,1fr)] md:items-center"
                            >
                              <span className="text-sm text-text-secondary">{outcome}</span>
                              <input
                                value={source.outcome_mappings[mappingIndex] ?? ''}
                                onChange={(event) =>
                                  updateSourceMapping(
                                    sourceIndex,
                                    mappingIndex,
                                    event.target.value
                                  )
                                }
                                className="w-full"
                                placeholder={`Value that maps to ${outcome}`}
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5">
                        <button
                          type="button"
                          onClick={() => void handlePreviewSource(sourceIndex)}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-text-primary transition hover:border-text-muted hover:bg-bg-card-hover"
                        >
                          {preview?.loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          Test Source
                        </button>

                        {preview ? (
                          <div className="mt-4 rounded-lg border border-border bg-bg-base p-4">
                            <p className="text-sm text-text-secondary">
                              Adapter: <span className="text-text-primary">{preview.adapter}</span>
                            </p>
                            <p className="mt-2 text-sm text-text-secondary">
                              Extracted value:{' '}
                              <span className="text-text-primary">
                                {preview.extracted ?? 'null'}
                              </span>
                            </p>
                            {preview.error ? (
                              <p className="mt-2 text-sm text-status-disputed">
                                {preview.error}
                              </p>
                            ) : null}
                            <pre className="mt-4 max-h-72 overflow-auto rounded-lg border border-border bg-bg-surface p-4 font-mono text-xs text-status-open">
                              {preview.payload}
                            </pre>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  )
                })}

                <button
                  type="button"
                  onClick={addSource}
                  disabled={sources.length >= MAX_SOURCES}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-surface px-4 py-2 text-sm text-text-secondary transition hover:border-text-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                  Add Source
                </button>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-bg-surface p-5">
                  <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-text-primary">
                    Deploy Receipt
                  </h2>
                  <p className="mt-3 text-text-secondary">{question || 'No question set.'}</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-border bg-bg-surface p-5">
                    <h2 className="text-lg font-semibold text-text-primary">Market Config</h2>
                    <div className="mt-4 space-y-2 text-sm text-text-secondary">
                      <p>Category: {category}</p>
                      <p>Deadline: {deadline ? new Date(deadlineMs).toLocaleString() : 'Unset'}</p>
                      <p>
                        Consensus: {Math.min(consensusThreshold, sources.length)} of{' '}
                        {sources.length}
                      </p>
                      <p>Estimated fee: ~0.000005 RIALO</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-bg-surface p-5">
                    <h2 className="text-lg font-semibold text-text-primary">Outcomes</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {outcomes.map((outcome) => (
                        <span
                          key={outcome}
                          className="rounded-full border border-border bg-bg-card px-3 py-1.5 text-sm text-text-primary"
                        >
                          {outcome}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-bg-surface p-5">
                  <h2 className="text-lg font-semibold text-text-primary">Resolution Sources</h2>
                  <div className="mt-4 space-y-4">
                    {sources.map((source, index) => (
                      <div
                        key={`${source.label}-${index}`}
                        className="rounded-xl border border-border bg-bg-card p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary">{source.label}</p>
                            <p className="mt-1 truncate text-sm text-text-secondary">
                              {source.url}
                            </p>
                          </div>
                          <span className="rounded-full border border-border px-3 py-1 font-mono text-xs text-text-muted">
                            {source.json_path}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {stepError ? (
            <p className="mt-6 text-sm text-status-disputed">{stepError}</p>
          ) : null}
          {submitError ? (
            <p className="mt-3 text-sm text-status-disputed">{submitError}</p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-5 py-3 text-sm font-medium text-text-primary transition hover:border-text-muted hover:bg-bg-card-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-hot px-5 py-3 text-sm font-semibold text-white transition duration-150 ease-out hover:scale-[1.02] hover:brightness-110 active:scale-[0.97]"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : wallet?.connected ? (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-hot px-5 py-4 font-display text-2xl uppercase tracking-[0.08em] text-white transition duration-150 ease-out hover:scale-[1.02] hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Deploy Market
              </button>
            ) : (
              <div className="rounded-lg border border-border bg-bg-surface px-5 py-3 text-sm text-text-secondary">
                Connect wallet to continue
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
          <div className="rounded-xl border border-border bg-bg-card p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">
              Deployment Summary
            </p>
            <p className="mt-4 text-sm text-text-secondary">
              Wallet: <span className="text-text-primary">{wallet?.label ?? 'Not connected'}</span>
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Fee estimate: <span className="text-text-primary">{estimatedFee}</span>
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Sources: <span className="text-text-primary">{sources.length}</span>
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Outcomes: <span className="text-text-primary">{outcomes.length}</span>
            </p>
          </div>

          <div className="rounded-xl border border-border bg-bg-card p-5">
            <p className="text-sm font-semibold text-text-primary">Templates</p>
            <div className="mt-4 space-y-3">
              {(Object.entries(SOURCE_TEMPLATES) as Array<
                [keyof typeof SOURCE_TEMPLATES, (typeof SOURCE_TEMPLATES)[keyof typeof SOURCE_TEMPLATES]]
              >).map(([key, template]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyTemplate(key)}
                  className="block w-full rounded-xl border border-border bg-bg-surface px-4 py-3 text-left transition hover:border-text-muted"
                >
                  <span className="block text-sm font-semibold text-text-primary">{key}</span>
                  <span className="mt-1 block text-xs text-text-secondary">
                    {template.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
