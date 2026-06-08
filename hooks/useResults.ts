'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ARCHETYPES, getNTITypeById } from '@/lib/nti-config'
import { DimensionId, ArchetypeId } from '@/lib/nti-scoring'
import { useSearchParams } from 'next/navigation'

interface ResultData {
    id?: string
    archetype_id: string
    microtype_id: string
    microtype_tags: string[]
    user_vector: Record<DimensionId, number>
    distance_score?: number
    created_at?: string
}

export interface NormalizedResults {
    ntiType: ReturnType<typeof getNTITypeById>
    primaryArchetypeId: ArchetypeId
    secondaryArchetypeId: ArchetypeId | null
    primaryArchetype: typeof ARCHETYPES[ArchetypeId]
    secondaryArchetype: typeof ARCHETYPES[ArchetypeId] | null
    scores: Record<DimensionId, number>
    isAnonymous: boolean
}

export function useResults(userId?: string, initialData?: ResultData | null) {
    const [results, setResults] = useState<NormalizedResults | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const searchParams = useSearchParams()
    const supabase = createClient()

    useEffect(() => {
        setLoading(true)
        setError(null)

        const fromLoginParam = searchParams.get('from_login')

        if (initialData) {
            const ntiType = getNTITypeById(initialData.archetype_id)
            const primaryArchetypeId = initialData.microtype_id as ArchetypeId
            const secondaryArchetypeId = initialData.microtype_tags?.[1] as ArchetypeId | undefined
            const primaryArchetype = ARCHETYPES[primaryArchetypeId]
            const secondaryArchetype = secondaryArchetypeId ? ARCHETYPES[secondaryArchetypeId] : null

            if (!ntiType || !primaryArchetype) {
                setError('Unable to load your results. Please try again.')
                setLoading(false)
                return
            }

            setResults({
                ntiType,
                primaryArchetypeId,
                secondaryArchetypeId: secondaryArchetypeId || null,
                primaryArchetype,
                secondaryArchetype,
                scores: initialData.user_vector || {},
                isAnonymous: false
            })
            setLoading(false)
            return
        }

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
                        const ntiType = getNTITypeById(data.archetype_id)
                        const primaryArchetypeId = data.microtype_id as ArchetypeId
                        const secondaryArchetypeId = data.microtype_tags?.[1] as ArchetypeId | undefined
                        const primaryArchetype = ARCHETYPES[primaryArchetypeId]
                        const secondaryArchetype = secondaryArchetypeId ? ARCHETYPES[secondaryArchetypeId] : null

                        if (!ntiType || !primaryArchetype) {
                            setError('Unable to load your results. Please try again.')
                            setLoading(false)
                            return
                        }

                        setResults({
                            ntiType,
                            primaryArchetypeId,
                            secondaryArchetypeId: secondaryArchetypeId || null,
                            primaryArchetype,
                            secondaryArchetype,
                            scores: data.user_vector || {},
                            isAnonymous: false
                        })
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
                        const ntiType = getNTITypeById(data.archetype_id)
                        const primaryArchetypeId = data.microtype_id as ArchetypeId
                        const secondaryArchetypeId = data.microtype_tags?.[1] as ArchetypeId | undefined
                        const primaryArchetype = ARCHETYPES[primaryArchetypeId]
                        const secondaryArchetype = secondaryArchetypeId ? ARCHETYPES[secondaryArchetypeId] : null

                        if (!ntiType || !primaryArchetype) {
                            setError('Unable to load your results. Please try again.')
                            setLoading(false)
                            return
                        }

                        setResults({
                            ntiType,
                            primaryArchetypeId,
                            secondaryArchetypeId: secondaryArchetypeId || null,
                            primaryArchetype,
                            secondaryArchetype,
                            scores: data.user_vector || {},
                            isAnonymous: false
                        })
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
    }, [userId, initialData, searchParams, supabase])

    return { results, loading, error }
}
