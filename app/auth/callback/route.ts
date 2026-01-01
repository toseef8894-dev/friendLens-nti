import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = createClient()
        
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            const url = new URL(next, origin)
            url.searchParams.set('error', 'invalid_or_expired_link')
            return NextResponse.redirect(url)
        }

        const userId = data.user?.id
        
        if (!userId) {
            const url = new URL(next, origin)
            url.searchParams.set('error', 'invalid_or_expired_link')
            return NextResponse.redirect(url)
        }

        const cookieStore = cookies()
        
        cookieStore.set('reset_user_id', userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60,
        })
        
        cookieStore.set('reset_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60,
        })

        return NextResponse.redirect(new URL(next, origin))
    }

    return NextResponse.redirect(new URL(next, origin))
}
