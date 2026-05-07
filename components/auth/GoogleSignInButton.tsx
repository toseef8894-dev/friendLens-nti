'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getPendingAnonymousResults } from '@/lib/storage-utils'
import { trackEvent } from '@/lib/analytics'

type GoogleSignInButtonProps = {
    disabled?: boolean
    label?: string
    /** Fires true when OAuth flow starts, false when it fails before redirect */
    onBusyChange?: (busy: boolean) => void
}

export default function GoogleSignInButton({ disabled, label, onBusyChange }: GoogleSignInButtonProps) {
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

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
            const hasPendingResults = !!getPendingAnonymousResults()
            const callbackPath = hasPendingResults
                ? `${baseUrl}/auth/callback?save_results=true`
                : `${baseUrl}/auth/callback`

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: callbackPath,
                },
            })
            if (error) throw error
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
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
            {loading ? 'Connecting...' : label ?? 'Continue with Google (fastest)'}
        </button>
    )
}
