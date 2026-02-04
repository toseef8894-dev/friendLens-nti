import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '') {
        const code = request.nextUrl.searchParams.get('code')
        if (code) {
            const next = request.nextUrl.searchParams.get('next') || '/reset-password'
            const callbackUrl = new URL('/auth/callback', request.url)
            callbackUrl.searchParams.set('code', code)
            callbackUrl.searchParams.set('next', next)
            return NextResponse.redirect(callbackUrl)
        }
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    const isResetSession = request.cookies.get('reset_session')?.value === 'true'

    if (request.nextUrl.pathname.startsWith('/results')) {
        const isAnonymous = request.nextUrl.searchParams.get('anonymous') === 'true'
        
        if (!user && !isAnonymous) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        
        if (isResetSession && user) {
            return NextResponse.redirect(new URL('/reset-password', request.url))
        }
    } else if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        if (isResetSession) {
            return NextResponse.redirect(new URL('/reset-password', request.url))
        }
    } else if (request.nextUrl.pathname.startsWith('/friendlens')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        if (isResetSession) {
            return NextResponse.redirect(new URL('/reset-password', request.url))
        }
    }
    
    if (request.nextUrl.pathname.startsWith('/assessment')) {
        if (isResetSession && user) {
            return NextResponse.redirect(new URL('/reset-password', request.url))
        }
        if (user) {
            const { data: result } = await supabase
                .from('results')
                .select('id')
                .eq('user_id', user.id)
                .limit(1)
                .maybeSingle()
            
            if (result) {
                const redirectUrl = new URL('/results', request.url)
                redirectUrl.searchParams.set('redirected', 'true')
                return NextResponse.redirect(redirectUrl)
            }
        }
    }

    if (request.nextUrl.pathname.startsWith('/login')) {
        if (user) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }
    
    if (request.nextUrl.pathname.startsWith('/reset-password') || 
        request.nextUrl.pathname.startsWith('/forgot-password')) {
        return response
    }
    
    if (request.nextUrl.pathname.startsWith('/results')) {
        const isAnonymous = request.nextUrl.searchParams.get('anonymous') === 'true'
        
        if (user) {
            const { data: result } = await supabase
                .from('results')
                .select('id')
                .eq('user_id', user.id)
                .limit(1)
                .maybeSingle()
            
            if (!result && !isAnonymous) {
                return NextResponse.redirect(new URL('/assessment', request.url))
            }
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
