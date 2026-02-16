'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { LogOut, User as UserIcon, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { clearAuthToken } from '@/lib/auth-storage'
import { useAuth } from '@/hooks/useAuth'
import { useAdminStatus } from '@/hooks/useAdminStatus'
import { useAssessmentStatus } from '@/hooks/useAssessmentStatus'
import { useClickOutside } from '@/hooks/useClickOutside'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    const { user } = useAuth({ clearStorageOnSignOut: true })
    const { isAdmin } = useAdminStatus({ userId: user?.id })
    const { hasCompletedAssessment } = useAssessmentStatus({ userId: user?.id })

    const yourStyleHref = hasCompletedAssessment ? '/results?my_results=true' : '/assessment'

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/')

    useClickOutside(menuRef, () => {
        if (isMenuOpen) {
            setIsMenuOpen(false)
        }
    })

    useEffect(() => {
        setIsMenuOpen(false)
    }, [user])

    const handleLogout = async () => {
        setIsMenuOpen(false)

        try {
            await fetch('/api/nti/v1/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }).catch(() => {
            })

            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                await supabase.auth.signOut().catch(() => {
                })
            }
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
            clearAuthToken()

            if (typeof window !== 'undefined') {
                localStorage.clear()

                sessionStorage.clear()

                document.cookie.split(";").forEach((c) => {
                    const cookieName = c.trim().split("=")[0]
                    document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
                    document.cookie = `${cookieName}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
                })
            }

            await new Promise(resolve => setTimeout(resolve, 100))

            toast.success('Signed out successfully')
            window.location.href = '/'
        }
    }

    return (
        <header className="w-full h-20 px-4 sm:px-20 flex items-center justify-between border-b border-black/5 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            {/* Logo */}
            <Link href="/" className="flex items-center">
                <h1 className="text-brand-blue text-xl font-bold leading-7" style={{ letterSpacing: '-0.449px' }}>
                    FriendLens
                </h1>
            </Link>

            {/* Navigation - Only show when logged in */}
            {user && (
                <nav className="hidden sm:flex items-center gap-4 md:gap-8">
                    <Link
                        href={yourStyleHref}
                        className={`text-sm md:text-base font-medium leading-6 transition-colors ${(isActive('/results') || isActive('/assessment')) ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                            }`}
                        style={{ letterSpacing: '-0.312px' }}
                    >
                        Your Style
                    </Link>
                    <Link
                        href="/friendlens/your-people"
                        className={`text-sm md:text-base font-medium leading-6 transition-colors ${isActive('/friendlens/your-people') ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                            }`}
                        style={{ letterSpacing: '-0.312px' }}
                    >
                        Your People
                    </Link>
                    <Link
                        href="/friendlens/your-sources"
                        className={`text-sm md:text-base font-medium leading-6 transition-colors ${isActive('/friendlens/your-sources') ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                            }`}
                        style={{ letterSpacing: '-0.312px' }}
                    >
                        Your Sources
                    </Link>
                    <Link
                        href="/friendlens/your-time"
                        className={`text-sm md:text-base font-medium leading-6 transition-colors ${isActive('/friendlens/your-time') ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                            }`}
                        style={{ letterSpacing: '-0.312px' }}
                    >
                        Your Time
                    </Link>
                </nav>
            )}

            {/* User Menu */}
            <div className='flex gap-5'>
                {
                    isAdmin && (
                        <Link
                            href="/admin"
                            className={`flex items-center gap-1.5 text-sm md:text-base font-medium leading-6 transition-colors ${isActive('/admin') ? 'text-purple-700' : 'text-purple-600 hover:text-purple-700'
                                }`}
                            style={{ letterSpacing: '-0.312px' }}
                        >
                            <Shield size={16} />
                            Admin
                        </Link>
                    )}
                {user ? (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center hover:bg-brand-blue/20 transition-colors"
                        >
                            <UserIcon className="w-5 h-5 text-brand-blue" strokeWidth={1.67} />
                        </button>

                        {isMenuOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                    {isAdmin && (
                                        <p className="text-xs text-purple-600 font-medium">Admin</p>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setIsMenuOpen(false)

                                        toast.info(
                                            'Redirecting you to your results page. If you want to retake the survey, see the link at the bottom of the page.',
                                            { duration: 3000 }
                                        )

                                        router.push('/results?my_results=true')
                                    }}
                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    My Results
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <LogOut size={16} />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center hover:bg-brand-blue/20 transition-colors"
                    >
                        <UserIcon className="w-5 h-5 text-brand-blue" strokeWidth={1.67} />
                    </Link>
                )}
            </div>
        </header>
    )
}
