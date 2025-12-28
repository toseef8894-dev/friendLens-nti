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
                setIsLoading(true)
                const { data: { user }, error: userError } = await supabase.auth.getUser()
                
                if (userError) {
                    console.error('Error getting user:', userError)
                    setIsAuthenticated(false)
                    setHasCompletedAssessment(false)
                    return
                }

                const authenticated = !!user
                setIsAuthenticated(authenticated)

                if (authenticated && user) {
                    // Check if user has completed assessment (has results)
                    const { data: result, error: resultError } = await supabase
                        .from('results')
                        .select('id')
                        .eq('user_id', user.id)
                        .limit(1)
                        .maybeSingle()

                    if (resultError) {
                        console.error('Error checking results:', resultError)
                        setHasCompletedAssessment(false)
                    } else {
                        setHasCompletedAssessment(!!result)
                    }
                } else {
                    setHasCompletedAssessment(false)
                }
            } catch (error) {
                console.error('Error in checkAuthAndAssessment:', error)
                setIsAuthenticated(false)
                setHasCompletedAssessment(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuthAndAssessment()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const authenticated = !!session?.user
            setIsAuthenticated(authenticated)

            if (authenticated && session?.user) {
                // Re-check results when auth state changes
                try {
                    const { data: result, error: resultError } = await supabase
                        .from('results')
                        .select('id')
                        .eq('user_id', session.user.id)
                        .limit(1)
                        .maybeSingle()

                    if (resultError) {
                        console.error('Error checking results on auth change:', resultError)
                        setHasCompletedAssessment(false)
                    } else {
                        setHasCompletedAssessment(!!result)
                    }
                } catch (error) {
                    console.error('Error in auth state change handler:', error)
                    setHasCompletedAssessment(false)
                }
            } else {
                setHasCompletedAssessment(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase])

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
        e.preventDefault()
        
        // Use router.push for client-side navigation
        router.push(redirectPath)
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

