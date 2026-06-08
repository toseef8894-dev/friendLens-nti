'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseAdminStatusOptions {
    userId: string | null | undefined
}

export function useAdminStatus(options: UseAdminStatusOptions) {
    const { userId } = options
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(false)
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        if (!userId) {
            setIsAdmin(false)
            setLoading(false)
            return
        }

        const checkAdminStatus = async () => {
            try {
                setLoading(true)
                const { data } = await supabase
                    .from('user_roles')
                    .select('roles!inner(name)')
                    .eq('user_id', userId)
                    .eq('roles.name', 'admin')
                    .limit(1)
                    .maybeSingle()

                setIsAdmin(!!data)
            } catch (err) {
                console.error('Error checking admin status:', err)
                setIsAdmin(false)
            } finally {
                setLoading(false)
            }
        }

        checkAdminStatus()
    }, [userId, supabase])

    return { isAdmin, loading }
}
