'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RecoverySessionHandler() {
    const router = useRouter()
    const supabase = createClient()
    const hasChecked = useRef(false)

    useEffect(() => {
        const checkRecoverySession = async () => {
            // Only check once
            if (hasChecked.current) return
            hasChecked.current = true

            try {
                // Check URL for recovery indicators first
                const urlParams = new URLSearchParams(window.location.search)
                const hashParams = new URLSearchParams(window.location.hash.substring(1))
                const type = urlParams.get('type') || hashParams.get('type')
                
                // If we have recovery type in URL, redirect immediately
                if (type === 'recovery' || window.location.hash.includes('type=recovery')) {
                    router.replace('/reset-password')
                    return
                }

                // Check referrer for Supabase verify endpoint with recovery
                const referrer = document.referrer
                if (referrer && referrer.includes('supabase.co/auth/v1/verify')) {
                    const referrerUrl = new URL(referrer)
                    const referrerType = referrerUrl.searchParams.get('type')
                    
                    if (referrerType === 'recovery') {
                        // Store recovery flag in sessionStorage to persist across redirects
                        sessionStorage.setItem('recovery_session', 'true')
                        router.replace('/reset-password')
                        return
                    }
                }

                // Check if we have a recovery session flag
                const isRecoverySession = sessionStorage.getItem('recovery_session') === 'true'
                
                // Check if we have a session
                const { data: { session } } = await supabase.auth.getSession()
                
                if (session?.user && isRecoverySession) {
                    // We have a recovery session, redirect to reset-password
                    router.replace('/reset-password')
                    return
                }

                // Check if session was just created (within last 30 seconds)
                // and we're on home page - might be a recovery session
                if (session?.user && window.location.pathname === '/') {
                    const sessionAge = session.expires_at 
                        ? (session.expires_at * 1000) - Date.now()
                        : 0
                    
                    // If session expires in less than 1 hour, it might be a recovery session
                    // Recovery sessions typically have shorter expiration
                    if (sessionAge > 0 && sessionAge < 3600000) {
                        // Check if user doesn't have assessment results (new user or recovery)
                        // This is a heuristic - recovery sessions often land on home page
                        const hasRecentActivity = sessionStorage.getItem('last_activity')
                        if (!hasRecentActivity) {
                            // Might be a recovery session, redirect to reset-password
                            // User can always navigate back if needed
                            router.replace('/reset-password')
                            return
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking recovery session:', error)
            }
        }

        // Only check if we're on the home page
        if (typeof window !== 'undefined' && window.location.pathname === '/') {
            // Small delay to ensure session is set
            setTimeout(checkRecoverySession, 100)
        }
    }, [router, supabase])

    return null
}

