import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase admin client that bypasses RLS using the service role key.
 * Only use this in server-side admin API routes.
 */
export function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export function createClient() {
    const cookieStore = cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // Next.js throws when attempting to set cookies inside a Server Component read phase.
                        // This is expected — the middleware or Route Handler is responsible for setting auth cookies.
                        console.warn(`[supabase/server] Could not set cookie "${name}":`, error)
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        console.warn(`[supabase/server] Could not remove cookie "${name}":`, error)
                    }
                },
            },
        }
    )
}
