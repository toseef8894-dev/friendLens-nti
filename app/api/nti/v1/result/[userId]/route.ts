import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ARCHETYPES, getNTITypeById } from '@/lib/nti-config'
import type { ArchetypeId } from '@/lib/nti-scoring'

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const supabase = createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { userId } = params

        if (user.id !== userId) {
            return NextResponse.json(
                { error: 'Forbidden: Cannot access other user results' },
                { status: 403 }
            )
        }

        const { data: result, error: resultError } = await supabase
            .from('results')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (resultError) {
            if (resultError.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'No results found for this user' },
                    { status: 404 }
                )
            }
            console.error('Result fetch error:', resultError)
            return NextResponse.json(
                { error: 'Failed to fetch result' },
                { status: 500 }
            )
        }

        const ntiType = getNTITypeById(result.archetype_id)

        const primaryArchetypeId = result.microtype_id as ArchetypeId
        const secondaryArchetypeId = result.microtype_tags?.[1] as ArchetypeId

        const primaryArchetype = primaryArchetypeId ? ARCHETYPES[primaryArchetypeId] : null
        const secondaryArchetype = secondaryArchetypeId ? ARCHETYPES[secondaryArchetypeId] : null

        if (!ntiType) {
            return NextResponse.json(
                { error: 'NTI type not found for this result' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            result: {
                id: result.id,
                nti_type: {
                    id: ntiType.id,
                    name: ntiType.name,
                    short_label: ntiType.short_label,
                    description: ntiType.description,
                    distance: result.distance_score
                },
                primary_archetype: primaryArchetype || null,
                secondary_archetype: secondaryArchetype || null,
                normalized_scores: result.user_vector,
                confidence: result.distance_score ? Math.max(0, 1 - (result.distance_score / 100)) : 0.5,
                created_at: result.created_at,
            }
        })

    } catch (error: any) {
        console.error('Result API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
