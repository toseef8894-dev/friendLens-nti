import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'

  const baseUrl =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    url.origin

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const redirectUrl = new URL(next, baseUrl)
      redirectUrl.searchParams.set('error', 'invalid_or_expired_link')
      return NextResponse.redirect(redirectUrl)
    }

    const userId = data.user?.id
    
    if (!userId) {
      const redirectUrl = new URL(next, baseUrl)
      redirectUrl.searchParams.set('error', 'invalid_or_expired_link')
      return NextResponse.redirect(redirectUrl)
    }

    const cookieStore = cookies()
    cookieStore.set('reset_user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    })
    cookieStore.set('reset_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    })
  }

  return NextResponse.redirect(new URL(next, baseUrl))
}
