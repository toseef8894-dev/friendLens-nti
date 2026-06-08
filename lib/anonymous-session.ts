'use client'
import { createClient } from '@/lib/supabase/client'

export async function ensureSession() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session) return
    await supabase.auth.signInAnonymously()
}
