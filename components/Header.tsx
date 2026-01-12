'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { LogOut, User as UserIcon, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { clearAuthToken } from '@/lib/auth-storage'
import { useAuth } from '@/hooks/useAuth'
import { useAdminStatus } from '@/hooks/useAdminStatus'
import { useClickOutside } from '@/hooks/useClickOutside'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const supabase = createClient()
    
    const { user } = useAuth({ clearStorageOnSignOut: true })
    const { isAdmin } = useAdminStatus({ userId: user?.id })

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
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold text-indigo-600 tracking-tight">FriendLens</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                                <Shield size={16} />
                                Admin
                            </Link>
                        )}

                        {user ? (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-1 hover:bg-gray-50 transition-colors"
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <UserIcon size={20} />
                                    </div>
                                </button>

                                {isMenuOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
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
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Sign in
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
