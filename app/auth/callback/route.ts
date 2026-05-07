import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { trackEvent } from '@/lib/analytics'

const POST_LOGIN_PATH = '/start-here-1a'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
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
