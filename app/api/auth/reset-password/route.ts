import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json()

        if (!password || password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            )
        }

        const cookieStore = cookies()
        const resetUserId = cookieStore.get('reset_user_id')?.value
        const isResetSession = cookieStore.get('reset_session')?.value === 'true'

        if (!resetUserId || !isResetSession) {
            return NextResponse.json(
                { error: 'Invalid or expired reset token' },
                { status: 401 }
            )
        }

        const supabase = createClient()

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
            cookieStore.delete('reset_user_id')
            cookieStore.delete('reset_session')
            return NextResponse.json(
                { error: 'No valid reset session found' },
                { status: 401 }
            )
        }

        if (session.user?.id !== resetUserId) {
            cookieStore.delete('reset_user_id')
            cookieStore.delete('reset_session')
            await supabase.auth.signOut()
            return NextResponse.json(
                { error: 'Invalid reset session' },
                { status: 401 }
            )
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: password
        })

        await supabase.auth.signOut()

        cookieStore.delete('reset_user_id')
        cookieStore.delete('reset_session')

        if (updateError) {
            return NextResponse.json(
                { error: updateError.message },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully'
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

