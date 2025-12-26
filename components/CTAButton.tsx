'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CTAButtonProps {
    text: string
    className?: string
    variant?: 'primary' | 'secondary'
}

export default function CTAButton({ text, className = '', variant = 'primary' }: CTAButtonProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [hasCompletedAssessment, setHasCompletedAssessment] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkAuthAndAssessment = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                const authenticated = !!user
                setIsAuthenticated(authenticated)

                if (authenticated && user) {
                    // Check if user has completed assessment
                    const { data: result } = await supabase
                        .from('results')
                        .select('id')
                        .eq('user_id', user.id)
                        .limit(1)
                        .maybeSingle()

                    setHasCompletedAssessment(!!result)
                } else {
                    setHasCompletedAssessment(false)
                }
            } catch (error) {
                setIsAuthenticated(false)
                setHasCompletedAssessment(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuthAndAssessment()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const authenticated = !!session?.user
            setIsAuthenticated(authenticated)

            if (authenticated && session?.user) {
                // Check if user has completed assessment
                const { data: result } = await supabase
                    .from('results')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .limit(1)
                    .maybeSingle()

                setHasCompletedAssessment(!!result)
            } else {
                setHasCompletedAssessment(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const getRedirectPath = () => {
        if (!isAuthenticated) {
            return '/login'
        }
        if (hasCompletedAssessment) {
            return '/results'
        }
        return '/assessment'
    }

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (isLoading) {
            e.preventDefault()
            return
        }

        const redirectPath = getRedirectPath()
        if (redirectPath !== '/login') {
            e.preventDefault()
            router.push(redirectPath)
        }
        // If not authenticated, let the Link handle navigation to /login
    }

    const baseClasses = variant === 'primary'
        ? 'inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'
        : 'inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'

    return (
        <Link
            href={getRedirectPath()}
            onClick={handleClick}
            className={`${baseClasses} ${className}`}
        >
            {text}
        </Link>
    )
}

