import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runNTIScoring, UserResponse } from '@/lib/nti-scoring'
import { QUESTIONS, NTI_TYPES, BEHAVIORAL_RULES } from '@/lib/nti-config'
import { toPrimaryType } from '@/lib/nti-utils'

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

        const body = await request.json()
        const { resultData } = body

        if (!resultData) {
            return NextResponse.json(
                { error: 'Result data is required' },
                { status: 400 }
            )
        }

        const { data: existingResult } = await supabase
            .from('results')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle()

        if (existingResult) {
            return NextResponse.json(
                { error: 'User already has results saved' },
                { status: 400 }
            )
        }

        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email || '',
                first_name: user.user_metadata?.first_name || null,
                last_name: user.user_metadata?.last_name || null,
                full_name: user.user_metadata?.full_name || null,
            })

        if (profileError) {
            console.error('Profile upsert error:', profileError)
            console.error('Profile error details:', {
                code: profileError.code,
                message: profileError.message,
                details: profileError.details,
                hint: profileError.hint,
                userId: user.id
            })

            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .maybeSingle()

            if (!existingProfile) {
                return NextResponse.json(
                    {
                        error: 'Failed to create user profile. Please contact support.',
                        details: process.env.NODE_ENV === 'development' ? profileError.message : undefined
                    },
                    { status: 500 }
                )
            }
        }

        const normalizedArchetypeId = toPrimaryType(resultData.archetype_id as any)

        const originalResponses = resultData.responses || []

        const { data: responseData, error: responseError } = await supabase
            .from('responses')
            .insert({
                user_id: user.id,
                config_version: 'NTI_V1',
                raw_answers: originalResponses,
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

        if (!responseData || !responseData.id) {
            return NextResponse.json(
                { error: 'Failed to create response record' },
                { status: 500 }
            )
        }

        const { data: result, error: resultError } = await supabase
            .from('results')
            .insert({
                user_id: user.id,
                response_id: responseData.id,
                archetype_id: normalizedArchetypeId,
                microtype_id: resultData.microtype_id,
                user_vector: resultData.user_vector,
                microtype_tags: resultData.microtype_tags || [resultData.microtype_id],
                distance_score: resultData.distance_score || 0,
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
                archetype_id: result.archetype_id,
            }
        })

    } catch (error: any) {
        console.error('Save anonymous results API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
