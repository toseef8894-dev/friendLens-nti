'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useDeferredCallback } from './useDeferredCallback'

interface UseAdminStatusOptions {
    userId: string | null | undefined
    defer?: boolean
}

export function useAdminStatus(options: UseAdminStatusOptions) {
    const { userId, defer = true } = options
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(false)
    const supabase = useMemo(() => createClient(), [])
    const { defer: deferCallback } = useDeferredCallback()

    useEffect(() => {
        if (!userId) {
            setIsAdmin(false)
            setLoading(false)
            return
        }

        const checkAdminStatus = async () => {
            try {
                setLoading(true)
                const { data: userRoles, error: userRolesError } = await supabase
                    .from('user_roles')
                    .select('role_id')
                    .eq('user_id', userId)

                if (userRolesError) {
                    setIsAdmin(false)
                    setLoading(false)
                    return
                }

                if (userRoles && userRoles.length > 0) {
                    const { data: roles, error: rolesError } = await supabase
                        .from('roles')
                        .select('id, name')

                    if (roles && !rolesError) {
                        const adminRole = roles.find(r => r.name === 'admin')
                        if (adminRole) {
                            const hasAdmin = userRoles.some(ur => ur.role_id === adminRole.id)
                            setIsAdmin(hasAdmin)
                        } else {
                            setIsAdmin(false)
                        }
                    } else {
                        setIsAdmin(false)
                    }
                } else {
                    setIsAdmin(false)
                }
                setLoading(false)
            } catch (err) {
                console.error('Error checking admin status:', err)
                setIsAdmin(false)
                setLoading(false)
            }
        }

        if (defer) {
            deferCallback(checkAdminStatus, { timeout: 2000 })
        } else {
            checkAdminStatus()
        }
    }, [userId, defer, supabase, deferCallback])

    return { isAdmin, loading }
}
