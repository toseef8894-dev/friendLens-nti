import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runNTIScoring, UserResponse } from '@/lib/nti-scoring'
import { QUESTIONS, NTI_TYPES, BEHAVIORAL_RULES } from '@/lib/nti-config'

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single()

        if (!existingProfile) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email || '',
                    first_name: user.user_metadata?.first_name || null,
                    last_name: user.user_metadata?.last_name || null,
                    full_name: user.user_metadata?.full_name || null,
                })

            if (profileError) {
                console.error('Profile creation error:', profileError)
                return NextResponse.json(
                    { error: 'Failed to create user profile. Please contact support.' },
                    { status: 500 }
                )
            }
        }

        const body = await request.json()
        const { responses } = body as { responses: UserResponse[] }

        if (!Array.isArray(responses) || responses.length === 0) {
            return NextResponse.json(
                { error: 'Missing or invalid responses array' },
                { status: 400 }
            )
        }

        const scoringResult = runNTIScoring(QUESTIONS, NTI_TYPES, responses, BEHAVIORAL_RULES)

        const { data: responseData, error: responseError } = await supabase
            .from('responses')
            .insert({
                user_id: user.id,
                config_version: 'NTI_V1',
                raw_answers: responses,
            })
            .select()
            .single()

        if (responseError) {
            console.error('Response save error:', responseError)
            return NextResponse.json(
                { error: 'Failed to save response: ' + responseError.message },
                { status: 500 }
            )
        }

        const { data: result, error: resultError } = await supabase
            .from('results')
            .insert({
                user_id: user.id,
                response_id: responseData.id,
                archetype_id: scoringResult.primary_type_16.id,
                microtype_id: scoringResult.primary_archetype_6,
                user_vector: scoringResult.normalized_scores,
                microtype_tags: [scoringResult.primary_archetype_6, scoringResult.secondary_archetype_6],
                distance_score: scoringResult.primary_type_16.distance,
            })
            .select()
            .single()

        if (resultError) {
            console.error('Result save error:', resultError)
            return NextResponse.json(
                { error: 'Failed to save result: ' + resultError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            result: {
                id: result.id,
                primary_type_16: scoringResult.primary_type_16,
                primary_archetype_6: scoringResult.primary_archetype_6,
                secondary_archetype_6: scoringResult.secondary_archetype_6,
                raw_scores: scoringResult.raw_scores,
                normalized_scores: scoringResult.normalized_scores,
                confidence: scoringResult.confidence,
            }
        })

    } catch (error: any) {
        console.error('Submit API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
