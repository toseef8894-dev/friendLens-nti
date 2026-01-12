'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useDeferredCallback } from './useDeferredCallback'

interface UseAssessmentStatusOptions {
    userId: string | null | undefined
    defer?: boolean
}

export function useAssessmentStatus(options: UseAssessmentStatusOptions) {
    const { userId, defer = true } = options
    const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false)
    const [loading, setLoading] = useState(false)
    const supabase = useMemo(() => createClient(), [])
    const { defer: deferCallback } = useDeferredCallback()

    useEffect(() => {
        if (!userId) {
            setHasCompletedAssessment(false)
            setLoading(false)
            return
        }

        const checkAssessmentStatus = async () => {
            try {
                setLoading(true)
                const { data: result, error: resultError } = await supabase
                    .from('results')
                    .select('id')
                    .eq('user_id', userId)
                    .limit(1)
                    .maybeSingle()

                if (resultError) {
                    console.error('Error checking results:', resultError)
                    setHasCompletedAssessment(false)
                } else {
                    setHasCompletedAssessment(!!result)
                }
                setLoading(false)
            } catch (error) {
                console.error('Error checking assessment status:', error)
                setHasCompletedAssessment(false)
                setLoading(false)
            }
        }

        if (defer) {
            deferCallback(checkAssessmentStatus, { timeout: 2000 })
        } else {
            checkAssessmentStatus()
        }
    }, [userId, defer, supabase, deferCallback])

    return { hasCompletedAssessment, loading }
}
