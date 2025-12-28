'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ARCHETYPES, NTI_TYPES } from '@/lib/nti-config'
import { DimensionId, DIMENSION_IDS, ArchetypeId } from '@/lib/nti-scoring'
import Link from 'next/link'

interface ResultData {
    id: string
    archetype_id: string
    microtype_id: string
    microtype_tags: string[]
    user_vector: Record<DimensionId, number>
    distance_score: number
    created_at: string
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

export default function ResultsView({ userId, initialData }: { userId: string, initialData: ResultData | null }) {
    const [result, setResult] = useState<ResultData | null>(initialData)
    const [loading, setLoading] = useState(false) 
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {

        if (initialData) {
            setLoading(false)
            return
        }

        setError('No results found. Please complete the assessment first.')
        setLoading(false)
    }, [userId, initialData])

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

    const ntiType = NTI_TYPES.find(t => t.id === result.archetype_id)
    const primaryArchetypeId = result.microtype_id as ArchetypeId
    const secondaryArchetypeId = result.microtype_tags?.[1] as ArchetypeId
    const primaryArchetype = ARCHETYPES[primaryArchetypeId]
    const secondaryArchetype = secondaryArchetypeId ? ARCHETYPES[secondaryArchetypeId] : null
    const scores = result.user_vector || {}

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide mb-2">
                        Your NTI Type
                    </p>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {ntiType?.name || 'Unknown Type'}
                    </h1>
                    <p className="text-lg text-purple-600 font-medium">
                        {ntiType?.short_label || ''}
                    </p>
                </div>

                {primaryArchetype && (
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                                PRIMARY
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

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Match Confidence</h3>
                            <p className="text-sm text-gray-500">How closely you match this type</p>
                        </div>
                        <div className="text-3xl font-bold text-indigo-600">
                            {Math.round((1 - Math.min(result.distance_score / 100, 1)) * 100)}%
                        </div>
                    </div>
                </div>

                <div className="text-center pt-4">
                    <Link href="/assessment" className="text-indigo-600 hover:text-indigo-500 font-medium">
                        Retake Assessment →
                    </Link>
                </div>
            </div>
        </div>
    )
}
