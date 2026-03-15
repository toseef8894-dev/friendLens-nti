'use client'

import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/hooks/useAuth'
// import { useAssessmentStatus } from '@/hooks/useAssessmentStatus'

interface CTAButtonProps {
    text: string
    className?: string
    variant?: 'primary' | 'secondary'
    // href?: string  // used when logged-in users should land on a specific page
}

export default function CTAButton({ text, className = '', variant = 'primary' }: CTAButtonProps) {
    // ── Future smart routing (re-enable when needed) ──────────────────────
    // const router = useRouter()
    // const { user, loading: authLoading } = useAuth({ deferInitialCheck: true })
    // const { hasCompletedAssessment } = useAssessmentStatus({ userId: user?.id })
    //
    // const getRedirectPath = () => {
    //     if (href && user) return href
    //     if (user && hasCompletedAssessment) return '/results?my_results=true'
    //     return '/friendlens/start-here'
    // }
    //
    // const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    //     if (authLoading) { e.preventDefault(); return }
    //     e.preventDefault()
    //     router.push(getRedirectPath())
    // }
    // ─────────────────────────────────────────────────────────────────────

    const baseClasses = variant === 'primary'
        ? 'inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'
        : 'inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'

    return (
        <Link
            href="/friendlens/start-here"
            // onClick={handleClick}  // re-enable with smart routing above
            className={`${baseClasses} ${className}`}
        >
            {text}
        </Link>
    )
}

