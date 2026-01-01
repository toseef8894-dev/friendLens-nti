import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies()
        const resetUserId = cookieStore.get('reset_user_id')?.value
        const isResetSession = cookieStore.get('reset_session')?.value === 'true'

        if (!resetUserId || !isResetSession) {
            return NextResponse.json(
                { valid: false, error: 'No valid reset session found' },
                { status: 401 }
            )
        }

        const { createClient } = await import('@/lib/supabase/server')
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session || session.user?.id !== resetUserId) {
            return NextResponse.json(
                { valid: false, error: 'No valid reset session found' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            valid: true,
            userId: resetUserId
        })
    } catch (error: any) {
        return NextResponse.json(
            { valid: false, error: error.message || 'Validation failed' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const cookieStore = cookies()
        cookieStore.delete('reset_user_id')
        cookieStore.delete('reset_session')
        
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

