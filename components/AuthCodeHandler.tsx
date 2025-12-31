'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthCodeHandlerInner() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const code = searchParams.get('code')
        const type = searchParams.get('type')

        if (code) {
            // If we have a code parameter, redirect to auth callback
            // The callback will handle the code exchange and redirect appropriately
            const callbackUrl = type === 'recovery' 
                ? `/auth/callback?code=${code}&type=recovery`
                : `/auth/callback?code=${code}`
            
            router.replace(callbackUrl)
        }
    }, [searchParams, router])

    return null
}

export default function AuthCodeHandler() {
    return (
        <Suspense fallback={null}>
            <AuthCodeHandlerInner />
        </Suspense>
    )
}

