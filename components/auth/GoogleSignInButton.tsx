'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'

type GoogleSignInButtonProps = {
    disabled?: boolean
    label?: string
    /** Fires true when OAuth flow starts, false when it fails before redirect */
    onBusyChange?: (busy: boolean) => void
}

export default function GoogleSignInButton({ disabled, label, onBusyChange }: GoogleSignInButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleGoogle = async () => {
        if (disabled || loading) return
        setLoading(true)
        onBusyChange?.(true)
        try {
            trackEvent('google_oauth_started')
            const baseUrl =
                process.env.NEXT_PUBLIC_SITE_URL ||
                (typeof window !== 'undefined' ? window.location.origin : '')
            if (!baseUrl) {
                throw new Error('Missing site URL configuration.')
            }
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
            if (!clientId) {
                throw new Error('Missing Google client ID configuration.')
            }

            // If the current user is anonymous, flag for post-upgrade toast
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.is_anonymous) {
                localStorage.setItem('upgrading_anonymous', 'true')
            }

            // Store a random state value to verify on callback (CSRF protection)
            const state = crypto.randomUUID()
            document.cookie = `google_oauth_state=${state}; path=/; max-age=600; samesite=lax; secure`

            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: `${baseUrl}/auth/callback`,
                response_type: 'code',
                scope: 'openid email profile',
                access_type: 'offline',
                state,
            })

            window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
        } catch (e: unknown) {
            setLoading(false)
            onBusyChange?.(false)
            trackEvent('google_oauth_failed')
            const message =
                e instanceof Error
                    ? e.message
                    : "We couldn't complete Google sign-in. Try email instead."
            toast.error(message)
        }
    }

    return (
        <button
            type="button"
            disabled={disabled || loading}
            onClick={() => void handleGoogle()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:hover:shadow-sm"
        >
            {!loading && (
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#fff" d="M21.6 12.227c0-.708-.064-1.39-.182-2.045H12v3.868h5.385a4.6 4.6 0 0 1-1.997 3.018v2.51h3.232c1.89-1.741 2.98-4.305 2.98-7.351z" />
                    <path fill="#fff" d="M12 22c2.7 0 4.964-.895 6.62-2.422l-3.232-2.51c-.895.6-2.04.955-3.388.955-2.605 0-4.81-1.76-5.598-4.123H3.064v2.59A9.996 9.996 0 0 0 12 22z" opacity=".85" />
                    <path fill="#fff" d="M6.402 13.9A6.003 6.003 0 0 1 6.09 12c0-.659.114-1.299.312-1.9V7.51H3.064A9.996 9.996 0 0 0 2 12c0 1.614.386 3.14 1.064 4.49l3.338-2.59z" opacity=".7" />
                    <path fill="#fff" d="M12 5.977c1.47 0 2.787.505 3.823 1.496l2.867-2.867C16.96 2.99 14.696 2 12 2A9.996 9.996 0 0 0 3.064 7.51l3.338 2.59C7.19 7.737 9.395 5.977 12 5.977z" opacity=".55" />
                </svg>
            )}
            {loading ? 'Connecting...' : label ?? 'Continue with Google'}
        </button>
    )
}
