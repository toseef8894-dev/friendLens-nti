'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { LogOut, User as UserIcon, Shield, Menu, X } from 'lucide-react'
import { toast } from 'sonner'
import { clearAuthToken } from '@/lib/auth-storage'
import { useAuth } from '@/hooks/useAuth'
import { useAdminStatus } from '@/hooks/useAdminStatus'
import { useAssessmentStatus } from '@/hooks/useAssessmentStatus'
import { useClickOutside } from '@/hooks/useClickOutside'

const NAV_ITEMS = [
    { label: 'Your People', href: '/friendlens/your-people', activePaths: ['/friendlens/your-people'] },
    { label: 'Your Sources', href: '/friendlens/your-sources', activePaths: ['/friendlens/your-sources'] },
    { label: 'Your Time', href: '/friendlens/your-time', activePaths: ['/friendlens/your-time'] },
    { label: 'Your Events', href: '/friendlens/your-calendar', activePaths: ['/friendlens/your-calendar'] },
    { label: 'Your Style', hrefKey: 'yourStyle' as const, activePaths: ['/friendlens/your-style', '/results', '/assessment'] },
]

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const mobileNavRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    const { user } = useAuth({ clearStorageOnSignOut: true })
    const { isAdmin } = useAdminStatus({ userId: user?.id })
    const { hasCompletedAssessment } = useAssessmentStatus({ userId: user?.id })

    const yourStyleHref = hasCompletedAssessment ? '/results?my_results=true' : '/friendlens/your-style'

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/')

    useClickOutside(menuRef, () => {
        if (isMenuOpen) {
            setIsMenuOpen(false)
        }
    })

    useClickOutside(mobileNavRef, () => {
        if (isMobileNavOpen) {
            setIsMobileNavOpen(false)
        }
    })

    useEffect(() => {
        setIsMenuOpen(false)
        setIsMobileNavOpen(false)
    }, [user])

    // Close mobile nav on route change
    useEffect(() => {
        setIsMobileNavOpen(false)
    }, [pathname])

    const handleLogout = async () => {
        setIsMenuOpen(false)
        setIsMobileNavOpen(false)

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

    const handleNavClick = (href: string) => {
        if (user) {
            router.push(href)
            setIsMobileNavOpen(false)
        } else {
            setIsMobileNavOpen(false)
            toast.info('To use this feature please log in or create an account.', {
                action: {
                    label: 'Log in',
                    onClick: () => router.push('/login'),
                },
            })
        }
    }

    const getHref = (item: typeof NAV_ITEMS[number]) =>
        item.hrefKey === 'yourStyle' ? yourStyleHref : item.href!

    const getIsActive = (item: typeof NAV_ITEMS[number]) =>
        item.activePaths.some(p => isActive(p))

    return (
        <>
            <header className="w-full h-16 sm:h-20 px-4 sm:px-20 flex items-center justify-between border-b border-black/5 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <h1 className="text-brand-blue text-lg sm:text-xl font-bold leading-7" style={{ letterSpacing: '-0.449px' }}>
                        FriendLens
                    </h1>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden sm:flex items-center gap-4 md:gap-8">
                    {NAV_ITEMS.map((item) => {
                        const href = getHref(item)
                        const active = getIsActive(item)
                        return user ? (
                            <Link
                                key={item.label}
                                href={href}
                                className={`text-sm md:text-base font-medium leading-6 transition-colors ${active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                                style={{ letterSpacing: '-0.312px' }}
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <button
                                key={item.label}
                                onClick={() => handleNavClick(href)}
                                className="text-sm md:text-base font-medium leading-6 transition-colors text-text-secondary hover:text-text-primary cursor-pointer"
                                style={{ letterSpacing: '-0.312px' }}
                            >
                                {item.label}
                            </button>
                        )
                    })}
                </nav>

                {/* Right side: hamburger (mobile) + admin + user menu */}
                <div className="flex items-center gap-3 sm:gap-5">
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className={`hidden sm:flex items-center gap-1.5 text-sm md:text-base font-medium leading-6 transition-colors ${isActive('/admin') ? 'text-purple-700' : 'text-purple-600 hover:text-purple-700'
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
                                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
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
                                    {isAdmin && (
                                        <Link
                                            href="/admin"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="sm:hidden w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                            <Shield size={14} />
                                            Admin
                                        </Link>
                                    )}
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

                    {/* Hamburger button - mobile only */}
                    <button
                        onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                        className="sm:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileNavOpen ? (
                            <X className="w-5 h-5 text-gray-700" />
                        ) : (
                            <Menu className="w-5 h-5 text-gray-700" />
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            {isMobileNavOpen && (
                <div
                    ref={mobileNavRef}
                    className="sm:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40"
                >
                    <nav className="flex flex-col py-2">
                        {NAV_ITEMS.map((item) => {
                            const href = getHref(item)
                            const active = getIsActive(item)
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => handleNavClick(href)}
                                    className={`w-full text-left px-6 py-3 text-base font-medium transition-colors ${active
                                        ? 'text-text-primary bg-gray-50'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            )
                        })}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                onClick={() => setIsMobileNavOpen(false)}
                                className={`px-6 py-3 text-base font-medium flex items-center gap-2 transition-colors ${isActive('/admin') ? 'text-purple-700 bg-gray-50' : 'text-purple-600 hover:text-purple-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Shield size={16} />
                                Admin
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </>
    )
}
