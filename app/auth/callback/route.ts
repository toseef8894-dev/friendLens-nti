import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error && data.session) {
            // If it's a recovery (password reset) flow, redirect to reset-password
            // We need to pass the session info via hash fragments
            if (type === 'recovery') {
                // Redirect to reset-password with hash fragments for client-side session handling
                return NextResponse.redirect(`${origin}/reset-password`)
            }
            return NextResponse.redirect(`${origin}${next}`)
        }
        
        // If there was an error, still try to redirect to reset-password for recovery
        // The reset-password page will handle invalid tokens
        if (type === 'recovery' && error) {
            return NextResponse.redirect(`${origin}/reset-password?error=invalid_token`)
        }
    }

    // Handle hash-based recovery tokens (from email links)
    // These come as hash fragments, so we check if we're being redirected from Supabase verify
    const hash = request.url.split('#')[1]
    if (hash) {
        const hashParams = new URLSearchParams(hash)
        const accessToken = hashParams.get('access_token')
        const recoveryType = hashParams.get('type')
        
        if (accessToken && recoveryType === 'recovery') {
            // Redirect to reset-password page with hash fragments
            return NextResponse.redirect(`${origin}/reset-password#${hash}`)
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
