'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PasswordResetHandler() {
    const router = useRouter()

    useEffect(() => {
        // Check if we have recovery tokens in the URL hash
        if (typeof window !== 'undefined') {
            const hash = window.location.hash
            if (hash) {
                const hashParams = new URLSearchParams(hash.substring(1))
                const accessToken = hashParams.get('access_token')
                const type = hashParams.get('type')

                // If we have a recovery token and we're not already on the reset page
                if (accessToken && type === 'recovery' && !window.location.pathname.includes('/reset-password')) {
                    // Redirect to reset-password page with the hash fragments
                    router.push(`/reset-password${hash}`)
                }
            }
        }
    }, [router])

    return null
}

