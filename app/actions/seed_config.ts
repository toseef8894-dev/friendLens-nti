'use server'

import { createClient } from '@/lib/supabase/server'
import { DIMENSION_IDS, ARCHETYPES, QUESTIONS, NTI_TYPES } from '@/lib/nti-config'
import { revalidatePath } from 'next/cache'

export async function seedConfig() {
    const supabase = createClient()

    // Check if config exists
    const { data: existing } = await supabase
        .from('assessment_configs')
        .select('id')
        .eq('version', 'NTI_V1')
        .single()

    if (existing) {
        return { success: true, message: 'Config NTI_V1 already exists' }
    }

    // Insert seed data
    const { error } = await supabase
        .from('assessment_configs')
        .insert({
            version: 'NTI_V1',
            active: true,
            questions: QUESTIONS,
            dimensions: DIMENSION_IDS,
            archetypes: ARCHETYPES,
            microtypes: NTI_TYPES
        })

    if (error) {
        console.error('Seed error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/assessment')
    console.log('Seed successful')
    return { success: true, message: 'Config NTI_V1 seeded successfully' }
}
