'use client'

import { useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { getPendingAnonymousResults, clearPendingAnonymousResults } from '@/lib/storage-utils'
import { useAuth } from '@/hooks/useAuth'
import { useDeferredCallback } from '@/hooks/useDeferredCallback'

export default function SaveAnonymousResults() {
    const hasRunRef = useRef<string | null>(null)
    const supabase = useMemo(() => createClient(), [])
    const { user } = useAuth({ deferInitialCheck: true })
    const { defer } = useDeferredCallback()

    useEffect(() => {
        if (user?.id !== hasRunRef.current) {
            hasRunRef.current = null
        }

        const executeSave = async () => {
            if (!user || hasRunRef.current === user.id) {
                return
            }

            hasRunRef.current = user.id

            await new Promise(resolve => setTimeout(resolve, 500))

            const pendingResultsStr = getPendingAnonymousResults()

            if (!pendingResultsStr) {
                return
            }

            try {
                const pendingResults = JSON.parse(pendingResultsStr)

                const { data: existingResult } = await supabase
                    .from('results')
                    .select('id')
                    .eq('user_id', user.id)
                    .limit(1)
                    .maybeSingle()

                if (existingResult) {
                    clearPendingAnonymousResults()
                    return
                }

                const response = await fetch('/api/nti/v1/save-anonymous-results', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resultData: pendingResults })
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to save results')
                }

                clearPendingAnonymousResults()

                toast.success('Your results have been saved!')
            } catch (error: unknown) {
                console.error('Error saving anonymous results:', error)
                const errorMessage = error instanceof Error ? error.message : 'Failed to save results. Please try again later.'
                toast.error(errorMessage)
                clearPendingAnonymousResults()
            }
        }

        if (user) {
            defer(executeSave, { timeout: 3000 })
        }
    }, [user, supabase, defer])

    return null
}
