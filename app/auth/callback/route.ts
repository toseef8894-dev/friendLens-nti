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
            if (type === 'recovery') {
                return NextResponse.redirect(`${origin}/reset-password?type=recovery`)
            }
            
            // If it's an email confirmation (signup), redirect to login with success message
            if (type === 'signup' || (!type && data.user)) {
                return NextResponse.redirect(`${origin}/login?confirmed=true`)
            }
            
            // Default redirect
            return NextResponse.redirect(`${origin}${next}`)
        }
        
        // Handle errors
        if (type === 'recovery' && error) {
            return NextResponse.redirect(`${origin}/reset-password?error=invalid_token`)
        }
        
        if (type === 'signup' && error) {
            return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
        }
        
        // Generic error
        if (error) {
            return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
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
