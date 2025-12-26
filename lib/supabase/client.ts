import { createBrowserClient } from '@supabase/ssr'

// Create a singleton Supabase client to avoid multiple instances
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
    if (supabaseClient) {
        return supabaseClient
    }

    supabaseClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            // Disable realtime to reduce background connections
            realtime: {
                params: {
                    eventsPerSecond: 1
                }
            }
        }
    )

    return supabaseClient
}
