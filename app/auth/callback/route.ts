import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const redirectUrl = new URL(next, baseUrl)
      redirectUrl.searchParams.set('error', 'invalid_or_expired_link')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.redirect(new URL(next, baseUrl))
}
