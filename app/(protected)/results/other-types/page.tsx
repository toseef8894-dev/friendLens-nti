'use client'

import { Suspense, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useResults } from '@/hooks/useResults'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArchetypeCard } from '@/components/ArchetypeCard'
import { ArchetypeModal } from '@/components/ArchetypeModal'
import { ArchetypeId } from '@/lib/nti-scoring'
import { ARCHETYPES } from '@/lib/nti-config'

function OtherTypesContent() {
    const searchParams = useSearchParams()
    const [userId, setUserId] = useState<string | undefined>(undefined)
    const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId | null>(null)
    const [primaryArchetypeId, setPrimaryArchetypeId] = useState<ArchetypeId | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id)
        }
        getUser()
    }, [supabase])

    useEffect(() => {
        const anonymousParam = searchParams.get('anonymous')
        if (anonymousParam === 'true') {
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
    }, [searchParams])

    const { results } = useResults(userId && !primaryArchetypeId ? userId : undefined, null)

    useEffect(() => {
        if (results?.primaryArchetypeId) {
            setPrimaryArchetypeId(results.primaryArchetypeId)
        }
    }, [results])

    const anonymousParam = searchParams.get('anonymous')

    const allArchetypeIds: ArchetypeId[] = ['Anchor', 'Connector', 'Hunter', 'Bonder', 'Sage', 'FlowMaker', 'Builder', 'Explorer']
    const otherArchetypes = primaryArchetypeId
        ? allArchetypeIds.filter(id => id !== primaryArchetypeId)
        : allArchetypeIds

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        The Other Seven Types
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Explore the other friendship types to understand how they influence friendship.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {otherArchetypes.map((archetypeId) => (
                        <ArchetypeCard
                            key={archetypeId}
                            archetypeId={archetypeId}
                            onOpen={() => setSelectedArchetype(archetypeId)}
                        />
                    ))}
                </div>

                <ArchetypeModal
                    archetypeId={selectedArchetype}
                    onClose={() => setSelectedArchetype(null)}
                />

                <div className="text-center pt-4">
                    <Link
                        href={`/results${anonymousParam === 'true' ? '?anonymous=true' : ''}`}
                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                        ← Back to Results
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function OtherTypesPage() {
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
            <OtherTypesContent />
        </Suspense>
    )
}
