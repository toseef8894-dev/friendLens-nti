'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useAssessmentStatus } from '@/hooks/useAssessmentStatus'

interface CTAButtonProps {
    text: string
    className?: string
    variant?: 'primary' | 'secondary'
}

export default function CTAButton({ text, className = '', variant = 'primary' }: CTAButtonProps) {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth({ deferInitialCheck: true })
    const { hasCompletedAssessment } = useAssessmentStatus({ userId: user?.id })
    
    const isLoading = authLoading

    const getRedirectPath = () => {
        if (user && hasCompletedAssessment) {
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

