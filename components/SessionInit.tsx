'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SessionInit() {
    useEffect(() => {
        const supabase = createClient()

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                // Store Prolific PID on existing session if present in URL
                const pid = new URLSearchParams(window.location.search).get('PROLIFIC_PID')
                if (pid) {
                    await supabase.auth.updateUser({ data: { prolific_pid: pid } })
                }
                return
            }

            const { error } = await supabase.auth.signInAnonymously()
            if (error) {
                console.error('Anonymous sign-in failed:', error.message)
                return
            }

            const pid = new URLSearchParams(window.location.search).get('PROLIFIC_PID')
            if (pid) {
                await supabase.auth.updateUser({ data: { prolific_pid: pid } })
            }
        }

        init()
    }, [])

    return null
}
