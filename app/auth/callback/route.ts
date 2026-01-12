import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'
  const errorParam = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  const baseUrl =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    url.origin

  if (errorParam) {
    const redirectUrl = new URL('/login', baseUrl)
    redirectUrl.searchParams.set('error', errorParam)
    if (errorDescription) {
      redirectUrl.searchParams.set('error_description', errorDescription)
    }
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      const redirectUrl = new URL('/login', baseUrl)
      redirectUrl.searchParams.set('error', 'invalid_or_expired_link')
      redirectUrl.searchParams.set('error_description', error.message || 'The confirmation link is invalid or has expired.')
      return NextResponse.redirect(redirectUrl)
    }

    const userId = data.user?.id
    
    if (!userId) {
      const redirectUrl = new URL('/login', baseUrl)
      redirectUrl.searchParams.set('error', 'invalid_or_expired_link')
      redirectUrl.searchParams.set('error_description', 'Unable to verify your account. Please try again.')
      return NextResponse.redirect(redirectUrl)
    }

    const isPasswordReset = next === '/reset-password' || next.includes('/reset-password')
    
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
    } else {
      await supabase.auth.signOut()
      const redirectUrl = new URL('/login', baseUrl)
      redirectUrl.searchParams.set('verified', 'true')
      redirectUrl.searchParams.set('message', 'Verification complete. Redirecting to login screen.')
      const saveResults = url.searchParams.get('save_results')
      if (saveResults === 'true') {
        redirectUrl.searchParams.set('save_results', 'true')
      }
      return NextResponse.redirect(redirectUrl)
    }
  } else {
    const redirectUrl = new URL('/login', baseUrl)
    redirectUrl.searchParams.set('error', 'missing_code')
    redirectUrl.searchParams.set('error_description', 'The confirmation link is missing required parameters.')
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.redirect(new URL(next, baseUrl))
}
