'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { LogOut, User as UserIcon, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { clearAuthToken, setAuthToken, setAuthUser, getAuthToken } from '@/lib/auth-storage'

export default function Header() {
    const [user, setUser] = useState<User | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const supabase = createClient()

    // Function to check admin status
    async function checkAdminStatus(userId: string) {
        try {
            const { data: userRoles, error: userRolesError } = await supabase
                .from('user_roles')
                .select('role_id')
                .eq('user_id', userId)

            if (userRolesError) {
                console.error('Error fetching user roles:', userRolesError)
                return
            }

            if (userRoles && userRoles.length > 0) {
                const { data: roles, error: rolesError } = await supabase
                    .from('roles')
                    .select('id, name')

                if (roles && !rolesError) {
                    const adminRole = roles.find(r => r.name === 'admin')
                    if (adminRole) {
                        const hasAdmin = userRoles.some(ur => ur.role_id === adminRole.id)
                        setIsAdmin(hasAdmin)
                    }
                }
            }
        } catch (err) {
            console.error('Error checking admin status:', err)
        }
    }

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isMenuOpen])

    useEffect(() => {
        const getUser = async () => {
            // Check if we have a stored token
            const storedToken = getAuthToken()
            
            const { data: { user }, error } = await supabase.auth.getUser()
            
            // If we have a stored token but no user, try to restore session
            if (storedToken && !user && !error) {
                // Token exists but session might be expired, let Supabase handle it
                // The onAuthStateChange will update the state accordingly
            }
            
            setUser(user)

            if (user) {
                await checkAdminStatus(user.id)
                // Ensure token is stored if user exists
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.access_token) {
                    setAuthToken(session.access_token)
                    setAuthUser(user)
                }
            } else {
                // No user, clear any stale tokens
                clearAuthToken()
            }
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ?? null)
            setIsMenuOpen(false)

            if (session?.user) {
                // Store token and user in localStorage on login
                if (session.access_token) {
                    setAuthToken(session.access_token)
                    setAuthUser(session.user)
                }
                // Check admin status immediately after login
                await checkAdminStatus(session.user.id)
            } else {
                // Clear localStorage on logout
                if (event === 'SIGNED_OUT') {
                    clearAuthToken()
                }
                setIsAdmin(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        setIsMenuOpen(false)
        
        try {
            // Clear localStorage first
            clearAuthToken()
            
            // Create a promise that resolves when auth state changes to SIGNED_OUT
            const signOutPromise = new Promise<void>((resolve) => {
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
                    if (event === 'SIGNED_OUT') {
                        subscription.unsubscribe()
                        resolve()
                    }
                })
                
                // Timeout after 1 second to prevent hanging
                setTimeout(() => {
                    subscription.unsubscribe()
                    resolve()
                }, 1000)
            })
            
            // Sign out from Supabase
            const { error } = await supabase.auth.signOut()
            
            if (error) {
                toast.error('Error signing out')
                console.error('Signout error:', error)
                return
            }
            
            // Wait for auth state change event to fire
            await signOutPromise
            
            // Ensure localStorage is cleared
            clearAuthToken()
            
            toast.success('Signed out successfully')
            
            // Force a full page reload to clear server-rendered data
            // This ensures the results page and other server components get fresh data
            window.location.href = '/'
        } catch (err) {
            console.error('Logout error:', err)
            toast.error('Error signing out')
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
                        {/* Admin Link - Only visible to admins */}
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
                                        <Link
                                            href="/results"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            My Results
                                        </Link>
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
