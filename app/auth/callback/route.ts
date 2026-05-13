import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { trackEvent } from '@/lib/analytics'

const POST_LOGIN_PATH = '/start-here-1a'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const stateParam = url.searchParams.get('state')   // present on direct Google OAuth only
  const nextParam = url.searchParams.get('next')
  const errorParam = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  const baseUrl =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    url.origin

  if (errorParam) {
    if (errorParam.includes('oauth')) {
      trackEvent('google_oauth_failed', { reason: errorParam })
    }
    const redirectUrl = new URL('/login', baseUrl)
    redirectUrl.searchParams.set('error', errorParam)
    if (errorDescription) {
      redirectUrl.searchParams.set('error_description', errorDescription)
    }
    return NextResponse.redirect(redirectUrl)
  }

  if (!code) {
    const redirectUrl = new URL('/login', baseUrl)
    redirectUrl.searchParams.set('error', 'missing_code')
    redirectUrl.searchParams.set(
      'error_description',
      'The confirmation link is missing required parameters.',
    )
    return NextResponse.redirect(redirectUrl)
  }

  const supabase = createClient()

  // ── Direct Google OAuth flow ───────────────────────────────────────────────
  if (stateParam) {
    const cookieStore = cookies()
    const storedState = cookieStore.get('google_oauth_state')?.value

    if (!storedState || storedState !== stateParam) {
      const redirectUrl = new URL('/login', baseUrl)
      redirectUrl.searchParams.set('error', 'invalid_state')
      redirectUrl.searchParams.set('error_description', 'OAuth state mismatch. Please try again.')
      return NextResponse.redirect(redirectUrl)
    }

    // Exchange Google code for tokens server-side (client secret stays safe)
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${baseUrl}/auth/callback`,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()

    if (!tokenRes.ok || !tokens.id_token) {
      trackEvent('google_oauth_failed', { reason: tokens.error ?? 'no_id_token' })
      const redirectUrl = new URL('/login', baseUrl)
      redirectUrl.searchParams.set('error', 'oauth_failed')
      redirectUrl.searchParams.set('error_description', 'Failed to exchange Google token. Please try again.')
      return NextResponse.redirect(redirectUrl)
    }

    // Hand Google id_token to Supabase — it creates/updates the session
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: tokens.id_token,
    })

    if (error || !data.user?.id) {
      trackEvent('google_oauth_failed', { reason: error?.message })
      const redirectUrl = new URL('/login', baseUrl)
      redirectUrl.searchParams.set('error', 'oauth_failed')
      redirectUrl.searchParams.set('error_description', error?.message ?? 'Sign-in failed. Please try again.')
      return NextResponse.redirect(redirectUrl)
    }

    cookieStore.delete('google_oauth_state')

    const saveResults = cookieStore.get('google_oauth_save_results')?.value === 'true'
    if (saveResults) cookieStore.delete('google_oauth_save_results')

    trackEvent('google_oauth_success')
    const target = new URL(POST_LOGIN_PATH, baseUrl)
    if (saveResults) target.searchParams.set('save_results', 'true')
    return NextResponse.redirect(target)
  }

  // ── Supabase email flow (email confirmation, password reset) ───────────────
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Auth callback error:', error)
    const redirectUrl = new URL('/login', baseUrl)
    const isOAuthLikeError = !nextParam || !nextParam.includes('/reset-password')
    redirectUrl.searchParams.set('error', isOAuthLikeError ? 'oauth_failed' : 'invalid_or_expired_link')
    redirectUrl.searchParams.set(
      'error_description',
      error.message || 'The confirmation link is invalid or has expired.',
    )
    if (isOAuthLikeError) {
      trackEvent('google_oauth_failed', { reason: error.message })
    }
    return NextResponse.redirect(redirectUrl)
  }

  const userId = data.user?.id
  if (!userId) {
    const redirectUrl = new URL('/login', baseUrl)
    redirectUrl.searchParams.set('error', 'invalid_or_expired_link')
    redirectUrl.searchParams.set(
      'error_description',
      'Unable to verify your account. Please try again.',
    )
    return NextResponse.redirect(redirectUrl)
  }

  const isPasswordReset =
    nextParam === '/reset-password' ||
    (typeof nextParam === 'string' && nextParam.includes('/reset-password'))

  if (isPasswordReset) {
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
    return NextResponse.redirect(new URL('/reset-password', baseUrl))
  }

  const saveResults = url.searchParams.get('save_results')
  const target = new URL(POST_LOGIN_PATH, baseUrl)
  if (saveResults === 'true') {
    target.searchParams.set('save_results', 'true')
  }
  const provider = data.user?.app_metadata?.provider
  if (provider === 'google') {
    trackEvent('google_oauth_success')
  } else {
    trackEvent('email_confirmed')
  }
  return NextResponse.redirect(target)
}
