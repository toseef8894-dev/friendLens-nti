import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ARCHETYPES, NTI_TYPES } from '@/lib/nti-config'
import type { ArchetypeId } from '@/lib/nti-scoring'

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const supabase = createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { userId } = params

        // Users can only access their own results
        if (user.id !== userId) {
            return NextResponse.json(
                { error: 'Forbidden: Cannot access other user results' },
                { status: 403 }
            )
        }

        // Fetch latest result for user
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

        // Get 16-type details
        const ntiType = NTI_TYPES.find(t => t.id === result.archetype_id)

        // Get archetype details (primary and secondary from microtype_tags)
        const primaryArchetypeId = result.microtype_id as ArchetypeId
        const secondaryArchetypeId = result.microtype_tags?.[1] as ArchetypeId

        const primaryArchetype = primaryArchetypeId ? ARCHETYPES[primaryArchetypeId] : null
        const secondaryArchetype = secondaryArchetypeId ? ARCHETYPES[secondaryArchetypeId] : null

        return NextResponse.json({
            success: true,
            result: {
                id: result.id,
                // 16-type
                primary_type_16: {
                    id: ntiType?.id || result.archetype_id,
                    name: ntiType?.name || 'Unknown',
                    short_label: ntiType?.short_label || '',
                    distance: result.distance_score
                },
                // 6-archetypes (archetype objects already have id property)
                primary_archetype_6: primaryArchetype || null,
                secondary_archetype_6: secondaryArchetype || null,
                // Scores
                normalized_scores: result.user_vector,
                // Confidence (calculate from distance)
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
