import { NextRequest, NextResponse } from 'next/server'
import { runNTIScoring, UserResponse } from '@/lib/nti-scoring'
import { QUESTIONS, NTI_TYPES, BEHAVIORAL_RULES } from '@/lib/nti-config'
import { toPrimaryType } from '@/lib/nti-utils'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { responses } = body as { responses: UserResponse[] }

        if (!Array.isArray(responses) || responses.length === 0) {
            return NextResponse.json(
                { error: 'Missing or invalid responses array' },
                { status: 400 }
            )
        }

        const scoringResult = runNTIScoring(QUESTIONS, NTI_TYPES, responses, BEHAVIORAL_RULES)

        const normalizedArchetypeId = toPrimaryType(scoringResult.nti_type.id as any)
        
        const ntiTypeConfig = NTI_TYPES.find(t => t.id === normalizedArchetypeId)

        return NextResponse.json({
            success: true,
            result: {
                nti_type: {
                    id: normalizedArchetypeId,
                    name: scoringResult.nti_type.name,
                    short_label: scoringResult.nti_type.short_label,
                    description: ntiTypeConfig?.description || scoringResult.nti_type.short_label,
                    distance: scoringResult.nti_type.distance
                },
                primary_archetype: scoringResult.primary_archetype,
                secondary_archetype: scoringResult.secondary_archetype,
                raw_scores: scoringResult.raw_scores,
                normalized_scores: scoringResult.normalized_scores,
                confidence: scoringResult.confidence,
            }
        })

    } catch (error: any) {
        console.error('Anonymous submit API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
