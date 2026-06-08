import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient()
        const cookieStore = cookies()

        const { error } = await supabase.auth.signOut()

        // Clear all auth-related cookies
        cookieStore.delete('reset_user_id')
        cookieStore.delete('reset_session')

        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        })

        const cookieNames = ['reset_user_id', 'reset_session']
        cookieNames.forEach(name => {
            response.cookies.set(name, '', {
                expires: new Date(0),
                path: '/',
            })
        })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return response

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
