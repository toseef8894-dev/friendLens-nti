'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { runNTIScoring, UserResponse } from '@/lib/nti-scoring'
import { QUESTIONS, NTI_TYPES, ARCHETYPES } from '@/lib/nti-config'

interface ScoreUserInput {
    responses: UserResponse[]
}

export async function scoreUser(input: ScoreUserInput) {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Not authenticated' }
    }

    try {
        // Run the NTI scoring algorithm
        const result = runNTIScoring(QUESTIONS, NTI_TYPES, input.responses)

        // Get archetype details
        const primaryArchetype = ARCHETYPES[result.primary_archetype_6]
        const secondaryArchetype = ARCHETYPES[result.secondary_archetype_6]

        // Save raw response to database
        const { data: responseData, error: responseError } = await supabase
            .from('responses')
            .insert({
                user_id: user.id,
                config_version: 'NTI_V1',
                raw_answers: input.responses,
            })
            .select()
            .single()

        if (responseError) {
            console.error('Response save error:', responseError)
            return { error: 'Failed to save response: ' + responseError.message }
        }

        // Save result to database
        const { error: resultError } = await supabase
            .from('results')
            .insert({
                user_id: user.id,
                response_id: responseData.id,
                archetype_id: result.primary_type_16.id,
                microtype_id: result.primary_archetype_6,
                user_vector: result.normalized_scores,
                microtype_tags: [result.primary_archetype_6, result.secondary_archetype_6],
                distance_score: result.primary_type_16.distance,
            })

        if (resultError) {
            console.error('Result save error:', resultError)
            return { error: 'Failed to save result: ' + resultError.message }
        }

        revalidatePath('/results')

        return {
            success: true,
            result: {
                // 16-type
                primary_type_16: result.primary_type_16,
                // 6-archetypes (archetype already has id property)
                primary_archetype_6: primaryArchetype,
                secondary_archetype_6: secondaryArchetype,
                // Scores
                raw_scores: result.raw_scores,
                normalized_scores: result.normalized_scores,
                // Confidence
                confidence: result.confidence,
            }
        }
    } catch (err: any) {
        console.error('Scoring error:', err)
        return { error: err.message || 'Scoring failed' }
    }
}
