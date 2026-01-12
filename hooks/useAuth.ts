'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { clearAuthToken, setAuthToken, setAuthUser } from '@/lib/auth-storage'

interface UseAuthOptions {
    clearStorageOnSignOut?: boolean
    deferInitialCheck?: boolean
}

export function useAuth(options: UseAuthOptions = {}) {
    const { clearStorageOnSignOut = false, deferInitialCheck = false } = options
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser()
                const { data: { session } } = await supabase.auth.getSession()

                if (error || !user || !session) {
                    clearAuthToken()
                    setUser(null)
                    setSession(null)
                    if (clearStorageOnSignOut && typeof window !== 'undefined') {
                        localStorage.clear()
                        sessionStorage.clear()
                    }
                    setLoading(false)
                    return
                }

                setUser(user)
                setSession(session)

                if (session?.access_token) {
                    setAuthToken(session.access_token)
                    setAuthUser(user)
                } else {
                    clearAuthToken()
                    setUser(null)
                    setSession(null)
                }
                setLoading(false)
            } catch (err) {
                console.error('Error getting user:', err)
                clearAuthToken()
                setUser(null)
                setSession(null)
                setLoading(false)
            }
        }

        if (deferInitialCheck) {
            setTimeout(getUser, 50)
        } else {
            getUser()
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            const newUser = newSession?.user ?? null
            setUser(newUser)
            setSession(newSession)

            if (newUser && newSession?.access_token) {
                setAuthToken(newSession.access_token)
                setAuthUser(newUser)
            } else {
                clearAuthToken()
                if (clearStorageOnSignOut && typeof window !== 'undefined') {
                    if (event === 'SIGNED_OUT' || !newSession) {
                        localStorage.clear()
                        sessionStorage.clear()
                    }
                }
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase, clearStorageOnSignOut, deferInitialCheck])

    return {
        user,
        session,
        loading,
        isAuthenticated: !!user,
    }
}
