import { createClient } from '@/lib/supabase/server'

/**
 * Check if user has completed the assessment
 */
export async function hasCompletedAssessment(userId: string): Promise<boolean> {
    const supabase = createClient()
    
    const { data, error } = await supabase
        .from('results')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle()
    
    if (error) {
        console.error('Error checking assessment completion:', error)
        return false
    }
    
    return data !== null
}

/**
 * Get user's latest result
 */
export async function getUserResult(userId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    
    if (error) {
        console.error('Error fetching user result:', error)
        return null
    }
    
    return data
}

