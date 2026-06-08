'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Shows a toast when an anonymous user successfully upgrades to a real account.
// The login page sets 'upgrading_anonymous' in localStorage before calling updateUser();
// this component checks that flag on mount and clears it once the user is confirmed real.
export default function SaveAnonymousResults() {
    useEffect(() => {
        if (typeof window === 'undefined') return
        if (localStorage.getItem('upgrading_anonymous') !== 'true') return

        const supabase = createClient()
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user && !user.is_anonymous) {
                localStorage.removeItem('upgrading_anonymous')
                toast.success('Account created. Your results have been saved!')
            }
        })
    }, [])

    return null
}
