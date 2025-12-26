// app/api/admin/stats/route.ts
// Admin API - Get dashboard statistics

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/rbac'

export async function GET() {
    try {
        // Verify admin access
        await requireAdmin()

        const supabase = createClient()

        // Get total signups (profiles count)
        const { count: totalSignups } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        // Get completed profiles (profiles with full_name)
        const { count: completedProfiles } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .not('full_name', 'is', null)

        // Get questionnaire submissions (responses count)
        const { count: totalSubmissions } = await supabase
            .from('responses')
            .select('*', { count: 'exact', head: true })

        // Get classified results (results count)
        const { count: totalResults } = await supabase
            .from('results')
            .select('*', { count: 'exact', head: true })

        // Calculate classification success rate
        const successRate = totalSubmissions && totalSubmissions > 0
            ? Math.round((totalResults || 0) / totalSubmissions * 100)
            : 0

        return NextResponse.json({
            stats: {
                totalSignups: totalSignups || 0,
                completedProfiles: completedProfiles || 0,
                totalSubmissions: totalSubmissions || 0,
                totalResults: totalResults || 0,
                successRate
            }
        })

    } catch (error: any) {
        if (error.message === 'Not authenticated') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        if (error.message === 'Admin access required') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        console.error('Admin stats error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
