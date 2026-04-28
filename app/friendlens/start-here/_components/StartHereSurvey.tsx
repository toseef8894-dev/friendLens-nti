'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { saveOnboardingFriend } from '../actions'
import {
    AFTER_CONTACT_FEELING_OPTIONS,
    CONTACT_FREQUENCY_OPTIONS,
    DESIRED_DIRECTION_OPTIONS,
    generateOnboardingInsight,
    INITIATION_PATTERN_OPTIONS,
    RELATIONSHIP_STAGE_OPTIONS,
    type OnboardingInsight,
    type OnboardingPersonInput,
} from '../_lib/onboardingInsight'
import StartHereLensSurvey1b from './StartHereLensSurvey1b'

type FormState = {
    name: string
    relationshipStage: OnboardingPersonInput['relationshipStage'] | ''
    contactFrequency: OnboardingPersonInput['contactFrequency'] | ''
    initiationPattern: OnboardingPersonInput['initiationPattern'] | ''
    afterContactFeeling: OnboardingPersonInput['afterContactFeeling'] | ''
    desiredDirection: OnboardingPersonInput['desiredDirection'] | ''
}

const EMPTY_FORM: FormState = {
    name: '',
    relationshipStage: '',
    contactFrequency: '',
    initiationPattern: '',
    afterContactFeeling: '',
    desiredDirection: '',
}

const ONBOARDING_INSIGHT_STORAGE_KEY = 'fl_onboarding_insight_v1'

function readInsightFromUrlStorage(): OnboardingInsight | null {
    if (typeof window === 'undefined') return null
    try {
        const sp = new URLSearchParams(window.location.search)
        if (sp.get('after') !== '1') return null
        const raw = sessionStorage.getItem(ONBOARDING_INSIGHT_STORAGE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as OnboardingInsight
        if (parsed && typeof parsed.title === 'string') return parsed
    } catch {
        // ignore
    }
    return null
}

function SelectField<T extends string>({
    label,
    value,
    options,
    onChange,
}: {
    label: string
    value: T | ''
    options: Array<[T, string]>
    onChange: (v: T) => void
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#62748E]">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172B] outline-none transition-colors focus:border-[#9810FA]"
            >
                <option value="">Choose one</option>
                {options.map(([val, display]) => (
                    <option key={val} value={val}>
                        {display}
                    </option>
                ))}
            </select>
        </label>
    )
}

/**
 * Start Here: 1a (add one person + insight) gates 1b (lens survey).
 * 1b renders only while an insight is present — not from stale session flags — so the form step stays clean.
 */
export default function StartHereSurvey() {
    const router = useRouter()
    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [insight, setInsight] = useState<OnboardingInsight | null>(readInsightFromUrlStorage)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isFormComplete = useMemo(
        () =>
            Boolean(
                form.name.trim() &&
                    form.relationshipStage &&
                    form.contactFrequency &&
                    form.initiationPattern &&
                    form.afterContactFeeling &&
                    form.desiredDirection,
            ),
        [form],
    )

    const handleSubmit = async () => {
        if (!isFormComplete || isSaving) return
        setIsSaving(true)
        setError(null)

        const payload: OnboardingPersonInput = {
            name: form.name.trim(),
            relationshipStage: form.relationshipStage as OnboardingPersonInput['relationshipStage'],
            contactFrequency: form.contactFrequency as OnboardingPersonInput['contactFrequency'],
            initiationPattern: form.initiationPattern as OnboardingPersonInput['initiationPattern'],
            afterContactFeeling: form.afterContactFeeling as OnboardingPersonInput['afterContactFeeling'],
            desiredDirection: form.desiredDirection as OnboardingPersonInput['desiredDirection'],
        }

        const result = await saveOnboardingFriend(payload)
        if (result.error) {
            setError(result.error)
            setIsSaving(false)
            return
        }

        const generated = generateOnboardingInsight(payload)
        try {
            sessionStorage.setItem(ONBOARDING_INSIGHT_STORAGE_KEY, JSON.stringify(generated))
        } catch {
            // ignore
        }
        setInsight(generated)
        setIsSaving(false)
        router.replace('/friendlens/start-here?after=1')
    }

    const resetToForm = () => {
        try {
            sessionStorage.removeItem(ONBOARDING_INSIGHT_STORAGE_KEY)
        } catch {
            // ignore
        }
        setForm(EMPTY_FORM)
        setInsight(null)
        setError(null)
        router.replace('/friendlens/start-here?add=1')
    }

    const confidenceLevel = insight
        ? insight.confidence === 'high'
            ? 3
            : insight.confidence === 'medium'
              ? 2
              : 1
        : 0
    const confidenceLabel = insight
        ? insight.confidence === 'high'
            ? 'Strong signal'
            : insight.confidence === 'medium'
              ? 'Moderate confidence'
              : 'Early signal'
        : ''

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8">
            <section aria-label="Add your first person">
                {insight ? (
                    <>
                        <div className="rounded-2xl border border-[#E2E8F0] bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
                            <div className="px-6 sm:px-7 pt-6 pb-4 border-b border-[#E2E8F0]">
                                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9810FA]">
                                    FriendLens Insight
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-[#0F172B]">{insight.title}</h2>
                                <p className="mt-2 text-sm text-[#62748E] leading-relaxed">{insight.message}</p>
                            </div>

                            <div className="px-6 sm:px-7 py-6">
                                <div className="rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9810FA]">
                                        {insight.actionLabel}
                                    </p>
                                    <p className="mt-2 text-sm text-[#0F172B] leading-relaxed">{insight.actionSuggestion}</p>
                                </div>

                                <div className="mt-5 flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3].map((i) => (
                                            <span
                                                key={i}
                                                className={`h-2 w-2 rounded-full ${
                                                    i <= confidenceLevel ? 'bg-[#9810FA]' : 'bg-[#E2E8F0]'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-[#62748E]">{confidenceLabel}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={resetToForm}
                                className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-semibold text-[#0F172B] hover:bg-[#F8FAFC] transition-colors"
                            >
                                Add one more person
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    try {
                                        sessionStorage.removeItem(ONBOARDING_INSIGHT_STORAGE_KEY)
                                    } catch {
                                        // ignore
                                    }
                                    router.push('/friendlens/your-people')
                                }}
                                className="inline-flex items-center gap-2 rounded-full bg-[#9810FA] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#7D0DD0] transition"
                            >
                                Go to People <span aria-hidden>→</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="rounded-2xl border border-[#E2E8F0] bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
                            <div className="px-6 sm:px-7 pt-6 pb-4 border-b border-[#E2E8F0]">
                                <h2 className="text-xl font-semibold text-[#0F172B]">
                                    Add one person. Get one useful insight.
                                </h2>
                                <p className="mt-1 text-sm text-[#62748E]">
                                    Pick someone real in your life. After you add them, FriendLens will show one clear
                                    insight and one simple next step.
                                </p>
                            </div>

                            <div className="px-6 sm:px-7 py-6 space-y-4">
                                <label className="block">
                                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#62748E]">
                                        Their name
                                    </span>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                        placeholder="First name is fine"
                                        className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172B] outline-none transition-colors focus:border-[#9810FA]"
                                    />
                                </label>

                                <SelectField
                                    label="Relationship stage"
                                    value={form.relationshipStage}
                                    options={RELATIONSHIP_STAGE_OPTIONS}
                                    onChange={(v) => setForm((prev) => ({ ...prev, relationshipStage: v }))}
                                />
                                <SelectField
                                    label="How often do you interact?"
                                    value={form.contactFrequency}
                                    options={CONTACT_FREQUENCY_OPTIONS}
                                    onChange={(v) => setForm((prev) => ({ ...prev, contactFrequency: v }))}
                                />
                                <SelectField
                                    label="Who usually initiates?"
                                    value={form.initiationPattern}
                                    options={INITIATION_PATTERN_OPTIONS}
                                    onChange={(v) => setForm((prev) => ({ ...prev, initiationPattern: v }))}
                                />
                                <SelectField
                                    label="How do you feel after contact?"
                                    value={form.afterContactFeeling}
                                    options={AFTER_CONTACT_FEELING_OPTIONS}
                                    onChange={(v) => setForm((prev) => ({ ...prev, afterContactFeeling: v }))}
                                />
                                <SelectField
                                    label="What do you want with this person?"
                                    value={form.desiredDirection}
                                    options={DESIRED_DIRECTION_OPTIONS}
                                    onChange={(v) => setForm((prev) => ({ ...prev, desiredDirection: v }))}
                                />

                                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-end">
                            <button
                                type="button"
                                disabled={!isFormComplete || isSaving}
                                onClick={handleSubmit}
                                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition ${
                                    isFormComplete && !isSaving
                                        ? 'bg-[#9810FA] text-white hover:bg-[#7D0DD0]'
                                        : 'bg-[#E2E8F0] text-[#90A1B9] cursor-not-allowed'
                                }`}
                            >
                                {isSaving ? 'Creating insight...' : 'Show my insight'} <span aria-hidden>→</span>
                            </button>
                        </div>
                    </>
                )}
            </section>

            {insight ? (
                <section aria-label="Where to look in FriendLens" className="pt-6">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent mb-5" />
                    <p className="mb-4 text-center text-sm leading-relaxed text-[#62748E]">
                        When you&apos;re ready, a very short pulse on how you&apos;re doing socially — then we&apos;ll
                        suggest where to look in FriendLens.
                    </p>
                    <div className="rounded-xl border border-[#E2E8F0]/80 bg-white/60 p-3 sm:p-4 shadow-sm">
                        <StartHereLensSurvey1b />
                    </div>
                </section>
            ) : null}
        </div>
    )
}
