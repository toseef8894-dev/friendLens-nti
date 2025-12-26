import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient()

        // Fetch active config
        const { data: config, error } = await supabase
            .from('assessment_configs')
            .select('id, version, questions, dimensions')
            .eq('active', true)
            .single()

        if (error || !config) {
            return NextResponse.json(
                { error: 'No active configuration found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            config: {
                id: config.id,
                version: config.version,
                questions: config.questions,
                dimensions: config.dimensions,
            }
        })

    } catch (error: any) {
        console.error('Config API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
