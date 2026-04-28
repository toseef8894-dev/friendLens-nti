'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────

type Level = 'ok' | 'good' | 'excellent'

type ItemKey =
    | 'quality'
    | 'across_places'
    | 'local_friends'
    | 'overall_social'
    | 'interpret_manage'

type SurveyAnswers = Record<ItemKey, Level | null>

type LensKey = 'people' | 'events' | 'time' | 'sources' | 'style'

type Recommendation =
    | {
          kind: 'threeStep'
          title: string
          subtitle: string
          steps: Array<{ lens: LensKey; label: string; blurb: string }>
      }
    | {
          kind: 'twoOptional'
          title: string
          subtitle: string
          options: Array<{ lens: LensKey; label: string; blurb: string }>
      }

const LENS: Record<LensKey, { label: string; href: string; accent: 'blue' | 'purple' | 'green' | 'teal' }> = {
    people: { label: 'Your People', href: '/friendlens/your-people', accent: 'blue' },
    events: { label: 'Your Events', href: '/friendlens/your-calendar', accent: 'purple' },
    time: { label: 'Your Time', href: '/friendlens/your-time', accent: 'green' },
    sources: { label: 'Your Sources', href: '/friendlens/your-sources', accent: 'teal' },
    style: { label: 'Your Style', href: '/friendlens/your-style', accent: 'purple' },
}

function computeRecommendation(answers: SurveyAnswers): Recommendation | null {
    const allAnswered = Object.values(answers).every((v) => v !== null)
    if (!allAnswered) return null

    const isLow = (k: ItemKey) => answers[k] === 'ok'
    const lows = (Object.keys(answers) as ItemKey[]).filter((k) => isLow(k))
    const goodOrExcellentCount = (Object.keys(answers) as ItemKey[]).filter(
        (k) => answers[k] === 'good' || answers[k] === 'excellent',
    ).length

    if (lows.length === 0 && goodOrExcellentCount >= 3) {
        return {
            kind: 'twoOptional',
            title: 'Your social life looks balanced',
            subtitle: "Nothing here needs fixing. Explore what's working and why.",
            options: [
                { lens: 'people', label: 'Your People', blurb: 'See reciprocity and stability in your local circles' },
                { lens: 'sources', label: 'Your Sources', blurb: 'Understand where your energy actually comes from' },
            ],
        }
    }

    if (isLow('local_friends')) {
        return {
            kind: 'threeStep',
            title: "Here's a good place to start",
            subtitle: 'Based on your answers, these areas tend to unlock clarity first.',
            steps: [
                { lens: 'people', label: 'Your People', blurb: "See who's active, reciprocal, and local" },
                { lens: 'events', label: 'Your Events', blurb: 'See your event rhythm and momentum' },
                { lens: 'time', label: 'Your Time', blurb: 'See whether capacity is the constraint' },
            ],
        }
    }

    if (isLow('interpret_manage')) {
        return {
            kind: 'threeStep',
            title: "Here's a good place to start",
            subtitle: 'Based on your answers, these areas tend to unlock clarity first.',
            steps: [
                { lens: 'style', label: 'Your Style', blurb: 'Clarify how you read signals and initiate' },
                { lens: 'sources', label: 'Your Sources', blurb: 'See where your social energy comes from' },
                { lens: 'people', label: 'Your People', blurb: 'Ground insights in real names and reciprocity' },
            ],
        }
    }

    if (isLow('overall_social')) {
        return {
            kind: 'threeStep',
            title: "Here's a good place to start",
            subtitle: 'Based on your answers, these areas tend to unlock clarity first.',
            steps: [
                { lens: 'time', label: 'Your Time', blurb: 'See where your hours actually go' },
                { lens: 'events', label: 'Your Events', blurb: 'Rebuild rhythm: recurring collisions with people' },
                { lens: 'people', label: 'Your People', blurb: 'Reconnect activities to humans who reciprocate' },
            ],
        }
    }

    return {
        kind: 'threeStep',
        title: "Here's a good place to start",
        subtitle: 'Based on your answers, these areas tend to unlock clarity first.',
        steps: [
            { lens: 'people', label: 'Your People', blurb: 'See reciprocity patterns' },
            { lens: 'events', label: 'Your Events', blurb: 'See rhythm and collisions' },
            { lens: 'time', label: 'Your Time', blurb: 'See capacity and constraints' },
        ],
    }
}

function AccentDot({ accent, children }: { accent: string; children: React.ReactNode }) {
    const map: Record<string, string> = {
        blue: 'bg-blue-500/20   text-blue-700   border-blue-500/20',
        purple: 'bg-violet-500/20 text-violet-700 border-violet-500/20',
        green: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/20',
        teal: 'bg-teal-500/20   text-teal-700   border-teal-500/20',
    }
    return (
        <div
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold flex-shrink-0 ${
                map[accent] ?? 'bg-slate-500/10 text-slate-700 border-slate-500/10'
            }`}
        >
            {children}
        </div>
    )
}

function ThreeStepPath({
    title,
    subtitle,
    steps,
    onBack,
    onRetake,
}: {
    title: string
    subtitle: string
    steps: Array<{ lens: LensKey; label: string; blurb: string }>
    onBack: () => void
    onRetake: () => void
}) {
    const accents: Array<'blue' | 'purple' | 'green'> = ['blue', 'purple', 'green']

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="py-8 text-center">
                <h2 className="text-2xl font-semibold text-[#0F172B]">{title}</h2>
                <p className="mt-2 text-[#62748E]">{subtitle}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {steps.slice(0, 3).map((s, idx) => {
                        const meta = LENS[s.lens]
                        const accent = accents[idx] ?? meta.accent

                        return (
                            <div key={s.lens} className="relative">
                                <div className="flex items-center gap-3">
                                    <AccentDot accent={accent}>{idx + 1}</AccentDot>
                                    {idx < 2 ? <div className="hidden h-px flex-1 bg-slate-200 md:block" /> : null}
                                </div>

                                <div className="mt-4">
                                    <div className="text-base font-semibold text-slate-900">
                                        {idx + 1}. {s.label}
                                    </div>
                                    <div className="mt-2 text-sm text-slate-600">{s.blurb}</div>

                                    <a
                                        href={meta.href}
                                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                                    >
                                        GO <span aria-hidden>→</span>
                                    </a>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-sm font-medium text-[#9810FA] hover:text-[#7810D0] transition-colors"
                >
                    ← Back
                </button>
                <button
                    type="button"
                    onClick={onRetake}
                    className="text-sm text-[#62748E] hover:text-[#0F172B] transition-colors"
                >
                    Start over
                </button>
            </div>

            <div className="mt-6 text-center border-t border-[#E2E8F0] pt-6">
                <p className="text-xs text-[#90A1B9] mb-2">Want a deeper read on your social style?</p>
                <Link
                    href="/assessment"
                    className="text-sm font-medium text-[#62748E] hover:text-[#0F172B] transition-colors"
                >
                    Take the full assessment →
                </Link>
            </div>
        </div>
    )
}

function TwoOptionalPaths({
    title,
    subtitle,
    options,
    onBack,
    onRetake,
}: {
    title: string
    subtitle: string
    options: Array<{ lens: LensKey; label: string; blurb: string }>
    onBack: () => void
    onRetake: () => void
}) {
    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white/80 backdrop-blur-sm shadow-sm">
                <div className="px-7 pt-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F172B]">{title}</h2>
                    <p className="mt-3 text-[#62748E]">{subtitle}</p>
                    <div className="mt-6 flex items-center justify-center gap-3 text-xs font-semibold tracking-widest text-[#90A1B9]">
                        <div className="h-px w-10 bg-[#E2E8F0]" />
                        OPTIONAL NEXT PATHS
                        <div className="h-px w-10 bg-[#E2E8F0]" />
                    </div>
                </div>

                <div className="px-7 pb-8 pt-6">
                    <div className="space-y-4">
                        {options.slice(0, 2).map((o, idx) => {
                            const meta = LENS[o.lens]
                            const highlighted = idx === 0
                            return (
                                <div
                                    key={o.lens}
                                    className={`flex items-center justify-between rounded-xl border bg-white px-6 py-5 ${
                                        highlighted ? 'border-[#9810FA]/30 shadow-sm' : 'border-[#E2E8F0]'
                                    }`}
                                >
                                    <div>
                                        <div className="text-base font-semibold text-[#0F172B]">{o.label}</div>
                                        <div className="mt-1 text-sm text-[#62748E]">{o.blurb}</div>
                                    </div>

                                    <Link
                                        href={meta.href}
                                        className="ml-4 flex-shrink-0 inline-flex items-center gap-2 rounded-xl border border-[#9810FA]/30 bg-white px-4 py-3 text-sm font-semibold text-[#9810FA] hover:bg-[#FAF5FF] transition-colors"
                                    >
                                        GO <span aria-hidden>→</span>
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-sm font-medium text-[#9810FA] hover:text-[#7810D0] transition-colors"
                >
                    ← Back
                </button>
                <button
                    type="button"
                    onClick={onRetake}
                    className="text-sm text-[#62748E] hover:text-[#0F172B] transition-colors"
                >
                    Start over
                </button>
            </div>

            <div className="mt-6 text-center border-t border-[#E2E8F0] pt-6">
                <p className="text-xs text-[#90A1B9] mb-2">Want a deeper read on your social style?</p>
                <Link
                    href="/assessment"
                    className="text-sm font-medium text-[#62748E] hover:text-[#0F172B] transition-colors"
                >
                    Take the full assessment →
                </Link>
            </div>
        </div>
    )
}

const ROWS: Array<{ key: ItemKey; label: string }> = [
    { key: 'quality', label: 'Quality of my friendships' },
    { key: 'across_places', label: 'Number of friends across places' },
    { key: 'local_friends', label: 'Number of local friends' },
    { key: 'overall_social', label: 'My overall social life (outside family and spouse)' },
    { key: 'interpret_manage', label: 'My ability to interpret and manage all of the above.' },
]

const LEVELS: Level[] = ['ok', 'good', 'excellent']
const LEVEL_LABELS: Record<Level, string> = { ok: 'OK', good: 'Good', excellent: 'Excellent' }

/** Start Here 1b — satisfaction survey + lens recommendations (after 1a onboarding). */
export default function StartHereLensSurvey1b() {
    const [answers, setAnswers] = useState<SurveyAnswers>({
        quality: null,
        across_places: null,
        local_friends: null,
        overall_social: null,
        interpret_manage: null,
    })
    const [submitted, setSubmitted] = useState(false)

    const allAnswered = Object.values(answers).every((v) => v !== null)
    const reco = useMemo(() => (submitted ? computeRecommendation(answers) : null), [submitted, answers])

    const handleBack = () => {
        setSubmitted(false)
    }

    const handleRetake = () => {
        setSubmitted(false)
        setAnswers({
            quality: null,
            across_places: null,
            local_friends: null,
            overall_social: null,
            interpret_manage: null,
        })
    }

    if (submitted && reco) {
        if (reco.kind === 'threeStep') {
            return (
                <ThreeStepPath
                    title={reco.title}
                    subtitle={reco.subtitle}
                    steps={reco.steps}
                    onBack={handleBack}
                    onRetake={handleRetake}
                />
            )
        }
        return (
            <TwoOptionalPaths
                title={reco.title}
                subtitle={reco.subtitle}
                options={reco.options}
                onBack={handleBack}
                onRetake={handleRetake}
            />
        )
    }

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
                <div className="px-6 sm:px-7 pt-6 pb-4 border-b border-[#E2E8F0]">
                    <h2 className="text-xl font-semibold text-[#0F172B]">Welcome to FriendLens.</h2>
                    <p className="mt-1 text-sm text-[#62748E]">
                        Take this quick survey to get a recommended place to start. There are no right or wrong answers.
                    </p>
                </div>

                <div className="grid grid-cols-[1fr_60px_60px_80px] sm:grid-cols-[1fr_100px_100px_110px] border-b border-[#E2E8F0] px-4 sm:px-7 py-3">
                    <div className="font-medium text-[#45556C] text-xs sm:text-sm">Social satisfaction levels:</div>
                    {LEVELS.map((lvl) => (
                        <div key={lvl} className="text-center font-medium text-[#45556C] text-xs sm:text-sm">
                            {LEVEL_LABELS[lvl]}
                        </div>
                    ))}
                </div>

                {ROWS.map((r) => (
                    <div
                        key={r.key}
                        className="grid grid-cols-[1fr_60px_60px_80px] sm:grid-cols-[1fr_100px_100px_110px] items-center border-b border-[#E2E8F0] last:border-b-0 px-4 sm:px-7 py-3 sm:py-4"
                    >
                        <div className="text-xs sm:text-sm text-[#0F172B] pr-2 leading-snug">{r.label}</div>
                        {LEVELS.map((lvl) => (
                            <div key={lvl} className="flex justify-center">
                                <input
                                    aria-label={`${r.label} ${LEVEL_LABELS[lvl]}`}
                                    type="radio"
                                    name={r.key}
                                    checked={answers[r.key] === lvl}
                                    onChange={() => setAnswers((prev) => ({ ...prev, [r.key]: lvl }))}
                                    className="h-5 w-5 cursor-pointer accent-violet-600"
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="mt-5 flex items-center justify-end">
                <button
                    type="button"
                    disabled={!allAnswered}
                    onClick={() => setSubmitted(true)}
                    className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition ${
                        allAnswered
                            ? 'bg-[#9810FA] text-white hover:bg-[#7D0DD0]'
                            : 'bg-[#E2E8F0] text-[#90A1B9] cursor-not-allowed'
                    }`}
                >
                    Continue <span aria-hidden>→</span>
                </button>
            </div>
        </div>
    )
}
