'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ARCHETYPES, getNTITypeById } from '@/lib/nti-config'
import { DimensionId, DIMENSION_IDS, ArchetypeId } from '@/lib/nti-scoring'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { EmailCaptureForm } from './EmailCaptureForm'
import { toast } from 'sonner'
import Insights from './Insights'
import { setPendingAnonymousResults } from '@/lib/storage-utils'

interface ResultData {
    id?: string
    archetype_id: string
    microtype_id: string
    microtype_tags: string[]
    user_vector: Record<DimensionId, number>
    distance_score?: number
    created_at?: string
}

interface AnonymousResult {
    nti_type: {
        id: string
        name: string
        short_label: string
        description?: string
        distance: number
    }
    primary_archetype: ArchetypeId
    secondary_archetype: ArchetypeId
    normalized_scores: Record<DimensionId, number>
}

const DIMENSION_LABELS: Record<DimensionId, string> = {
    DA: 'Drive',
    OX: 'Connection',
    '5HT': 'Wisdom',
    ACh: 'Focus',
    EN: 'Joy',
    GABA: 'Calm'
}

const DIMENSION_COLORS: Record<DimensionId, string> = {
    DA: '#EF4444',
    OX: '#EC4899',
    '5HT': '#8B5CF6',
    ACh: '#3B82F6',
    EN: '#10B981',
    GABA: '#6366F1'
}

function ResultsViewContent({ userId, initialData, showRedirectMessage, fromLogin, onPrimaryArchetypeChange }: { userId?: string, initialData: ResultData | null, showRedirectMessage?: boolean, fromLogin?: boolean, onPrimaryArchetypeChange?: (id: ArchetypeId | null) => void }) {
    const [result, setResult] = useState<ResultData | null>(initialData)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [anonymousResult, setAnonymousResult] = useState<AnonymousResult | null>(null)
    const searchParams = useSearchParams()
    const supabase = createClient()

    useEffect(() => {
        setLoading(true)
        setError(null)

        const anonymousParam = searchParams.get('anonymous')
        const fromLoginParam = searchParams.get('from_login')

        if (fromLoginParam === 'true' && userId && !initialData) {
            const fetchResult = async () => {
                try {
                    const { data, error } = await supabase
                        .from('results')
                        .select('*')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle()

                    if (error) {
                        console.error('Error fetching result:', error)
                        setError('No results found. Please complete the assessment first.')
                    } else if (data) {
                        setResult(data)
                        setIsAnonymous(false)
                        setLoading(false)
                        return
                    } else {
                        setError('No results found. Please complete the assessment first.')
                    }
                } catch (e) {
                    console.error('Error in fetchResult:', e)
                    setError('No results found. Please complete the assessment first.')
                } finally {
                    setLoading(false)
                }
            }
            fetchResult()
            return
        }

        if (anonymousParam === 'true') {
            const stored = sessionStorage.getItem('anonymousResults')
            if (stored) {
                try {
                    const parsed = JSON.parse(stored)
                    const resultData = parsed.result || parsed
                    setAnonymousResult(resultData)
                    setIsAnonymous(true)
                    setResult({
                        archetype_id: resultData.nti_type.id,
                        microtype_id: resultData.primary_archetype,
                        microtype_tags: [resultData.primary_archetype, resultData.secondary_archetype],
                        user_vector: resultData.normalized_scores,
                        distance_score: resultData.nti_type.distance
                    })
                    onPrimaryArchetypeChange?.(resultData.primary_archetype)
                    setLoading(false)
                    return
                } catch (e) {
                    console.error('Error parsing anonymous results:', e)
                    setError('Unable to load your results. Please try again.')
                    setLoading(false)
                    return
                }
            } else {
                setError('No results found. Please complete the assessment first.')
                setLoading(false)
                return
            }
        }

        if (initialData) {
            onPrimaryArchetypeChange?.(initialData.microtype_id as ArchetypeId)
            setLoading(false)
            return
        }

        if (userId) {
            const fetchResult = async () => {
                try {
                    const { data, error } = await supabase
                        .from('results')
                        .select('*')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle()

                    if (error) {
                        console.error('Error fetching result:', error)
                        setError('No results found. Please complete the assessment first.')
                    } else if (data) {
                        setResult(data)
                    } else {
                        setError('No results found. Please complete the assessment first.')
                    }
                } catch (e) {
                    console.error('Error in fetchResult:', e)
                    setError('No results found. Please complete the assessment first.')
                } finally {
                    setLoading(false)
                }
            }
            fetchResult()
        } else {
            setError('No results found. Please complete the assessment first.')
            setLoading(false)
        }
    }, [userId, initialData, searchParams, supabase, onPrimaryArchetypeChange])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your results...</p>
                </div>
            </div>
        )
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <p className="text-gray-600 mb-4">{error || 'No results found. Please complete the assessment first.'}</p>
                    <Link
                        href="/assessment"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-shadow"
                    >
                        Take Assessment
                    </Link>
                </div>
            </div>
        )
    }

    const ntiType = getNTITypeById(result.archetype_id)
    const primaryArchetypeId = result.microtype_id as ArchetypeId
    const secondaryArchetypeId = result.microtype_tags?.[1] as ArchetypeId
    const primaryArchetype = ARCHETYPES[primaryArchetypeId]
    const secondaryArchetype = secondaryArchetypeId ? ARCHETYPES[secondaryArchetypeId] : null
    const scores = result.user_vector || {}

    if (!ntiType) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <p className="text-gray-600 mb-4">Unable to load your results. Please try again.</p>
                    <Link
                        href="/assessment"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-shadow"
                    >
                        Take Assessment
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="text-center">
                            <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide mb-2">
                                Your Friend Type
                            </p>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                {ntiType.name}
                            </h1>
                            <p className="text-lg text-purple-600 font-medium mb-4">
                                {ntiType.short_label}
                            </p>
                            {ntiType.description && (
                                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                    {ntiType.description}
                                </p>
                            )}
                        </div>

                        {primaryArchetype && (
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                                        PRIMARY ARCHETYPE
                                    </span>
                                    <span className="text-white/80">{primaryArchetype.tagline}</span>
                                </div>
                                <h2 className="text-2xl font-bold mb-2">{primaryArchetype.name}</h2>
                                <p className="text-white/90 leading-relaxed">{primaryArchetype.description}</p>
                            </div>
                        )}

                        {secondaryArchetype && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                        SECONDARY
                                    </span>
                                    <span className="text-gray-500">{secondaryArchetype.tagline}</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{secondaryArchetype.name}</h2>
                                <p className="text-gray-600 leading-relaxed">{secondaryArchetype.description}</p>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Dimension Scores</h2>
                            <div className="space-y-4">
                                {DIMENSION_IDS.map(dim => {
                                    const score = scores[dim] || 0
                                    return (
                                        <div key={dim} className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">{DIMENSION_LABELS[dim]}</span>
                                                <span className="text-sm font-semibold text-gray-900">{Math.round(score)}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-3">
                                                <div
                                                    className="h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${score}%`, backgroundColor: DIMENSION_COLORS[dim] }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Match Confidence</h3>
                            <p className="text-sm text-gray-500">How closely you match this type</p>
                        </div>
                        <div className="text-3xl font-bold text-indigo-600">
                            {Math.round((1 - Math.min(result.distance_score / 100, 1)) * 100)}%
                        </div>
                    </div>
                </div> */}

                        {/* Account creation prompt for anonymous users */}
                        {isAnonymous && (
                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-sm space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                                        Save Your Results & Get Email Report
                                    </h3>
                                    <p className="text-yellow-800 mb-4">
                                        Create a free account to save your results in "My Results" and receive a detailed email report of your Friendship Archetype.
                                    </p>
                                    <Link
                                        href="/login?signup=true"
                                        onClick={() => {
                                            if (result) {
                                                const storedData = sessionStorage.getItem('anonymousResults')
                                                let responses: unknown[] = []

                                                if (storedData) {
                                                    try {
                                                        const parsed = JSON.parse(storedData)
                                                        responses = Array.isArray(parsed.responses) ? parsed.responses : []
                                                    } catch (e) {
                                                        console.warn('Could not parse stored responses', e)
                                                    }
                                                }

                                                const anonymousResults = {
                                                    archetype_id: result.archetype_id,
                                                    microtype_id: result.microtype_id,
                                                    microtype_tags: result.microtype_tags,
                                                    user_vector: result.user_vector,
                                                    distance_score: result.distance_score,
                                                    responses,
                                                    nti_type: ntiType ? {
                                                        name: ntiType.name,
                                                        short_label: ntiType.short_label,
                                                        description: ntiType.description
                                                    } : undefined
                                                }

                                                setPendingAnonymousResults(anonymousResults)
                                                console.log('Anonymous results and responses stored for account creation')
                                            }
                                        }}
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-shadow"
                                    >
                                        Create Account to Save Results
                                    </Link>
                                </div>

                                <div className="border-t border-yellow-200 pt-4">
                                    <p className="text-yellow-900 font-medium mb-2 text-sm">
                                        Or just send me my results via email:
                                    </p>
                                    {result && (
                                        <EmailCaptureForm
                                            resultData={{
                                                archetype_id: result.archetype_id,
                                                microtype_id: result.microtype_id,
                                                microtype_tags: result.microtype_tags,
                                                user_vector: result.user_vector,
                                                nti_type: ntiType ? {
                                                    name: ntiType.name,
                                                    short_label: ntiType.short_label,
                                                    description: ntiType.description
                                                } : undefined
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        )}


                        <div className="text-center pt-4">
                            <Link href="/assessment" className="text-indigo-600 hover:text-indigo-500 font-medium">
                                Retake Survey →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ResultsView({
    userId,
    initialData,
    showRedirectMessage,
    fromLogin,
}: {
    userId?: string
    initialData: ResultData | null
    showRedirectMessage?: boolean
    fromLogin?: boolean
}) {
    const [primaryArchetypeId, setPrimaryArchetypeId] = useState<ArchetypeId | null>(
        initialData?.microtype_id as ArchetypeId | null
    )

    // Also check for anonymous results
    useEffect(() => {
        if (!primaryArchetypeId) {
            const stored = sessionStorage.getItem('anonymousResults')
            if (stored) {
                try {
                    const parsed = JSON.parse(stored)
                    const resultData = parsed.result || parsed
                    if (resultData.primary_archetype) {
                        setPrimaryArchetypeId(resultData.primary_archetype)
                    }
                } catch (e) {
                    // Ignore parsing errors
                }
            }
        }
    }, [primaryArchetypeId])

    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your results...</p>
                    </div>
                </div>
            }
        >
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
                        <div className="lg:col-span-7">
                            <ResultsViewContent
                                userId={userId}
                                initialData={initialData}
                                showRedirectMessage={showRedirectMessage}
                                fromLogin={fromLogin}
                                onPrimaryArchetypeChange={setPrimaryArchetypeId}
                            />
                        </div>

                        <aside className="lg:col-span-3">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                <Insights primaryArchetypeId={primaryArchetypeId} />
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </Suspense>
    )
}
