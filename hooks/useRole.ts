'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Role = 'admin' | 'user'

export function useRole() {
    const [role, setRole] = useState<Role>('user')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchRole() {
            const supabase = createClient()

            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setLoading(false)
                return
            }

            const { data } = await supabase
                .from('user_roles')
                .select(`
          roles (name)
        `)
                .eq('user_id', user.id)

            if (data && data.length > 0) {
                // Check if admin role exists
                const hasAdmin = data.some((row: any) => row.roles?.name === 'admin')
                setRole(hasAdmin ? 'admin' : 'user')
            }

            setLoading(false)
        }

        fetchRole()
    }, [])

    return {
        role,
        isAdmin: role === 'admin',
        loading
    }
}
