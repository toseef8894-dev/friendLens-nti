'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { setAuthToken, setAuthUser, clearAuthToken } from '@/lib/auth-storage'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSignUp, setIsSignUp] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const errorParam = searchParams?.get('error')
    const confirmedParam = searchParams?.get('confirmed')

    useEffect(() => {
        const checkAndClearStaleAuth = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser()
                const { data: { session } } = await supabase.auth.getSession()

                if (error || !user || !session) {
                    await supabase.auth.signOut()
                    clearAuthToken()
                    if (typeof window !== 'undefined') {
                        localStorage.clear()
                        sessionStorage.clear()
                    }
                }
            } catch (err) {
                console.error('Error clearing stale auth:', err)
                clearAuthToken()
                if (typeof window !== 'undefined') {
                    localStorage.clear()
                    sessionStorage.clear()
                }
            }
        }
        checkAndClearStaleAuth()

        if (errorParam) {
            let errorMessage = 'Authentication failed. Please try again.'
            if (errorParam === 'confirmation_failed') {
                errorMessage = 'Email confirmation failed. Please request a new confirmation link.'
            } else if (errorParam === 'auth-code-error') {
                errorMessage = 'Invalid or expired confirmation link. Please try again.'
            }
            setError(errorMessage)
            toast.error(errorMessage)
        }

        if (confirmedParam === 'true') {
            toast.success('Email confirmed successfully! You can now sign in.')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errorParam, confirmedParam])

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isSignUp) {
                if (!firstName.trim() || !lastName.trim()) {
                    setError('First name and last name are required')
                    toast.error('Please enter your first and last name')
                    setLoading(false)
                    return
                }

                const { data: signupData, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                        data: {
                            first_name: firstName.trim(),
                            last_name: lastName.trim(),
                            full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
                        },
                    },
                })

                if (error) {
                    if (error.message.includes('database') || error.message.includes('profile')) {
                        throw new Error('Database error: Please contact support if this persists.')
                    }
                    throw error
                }

                if (!signupData.user) {
                    throw new Error('Failed to create user account')
                }

                if (signupData.user && !signupData.session) {
                    toast.success('Account created! Please check your email to confirm your account before signing in.')
                    setFirstName('')
                    setLastName('')
                    setEmail('')
                    setPassword('')
                    setIsSignUp(false)
                    setTimeout(() => {
                        toast.info('Didn\'t receive the email? You can resend it from the login page.', {
                            duration: 5000,
                        })
                    }, 2000)
                } else if (signupData.session) {
                    if (signupData.session.access_token) {
                        setAuthToken(signupData.session.access_token)
                        setAuthUser(signupData.user)
                    }

                    await fetch('/api/auth/clear-reset-cookies', {
                        method: 'POST'
                    }).catch(() => {
                        // Ignore errors
                    })

                    toast.success('Account created successfully!')
                    router.push('/')
                    router.refresh()
                }
            } else {
                const { data: signInData, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                if (error) {
                    if (error.message.includes('Email not confirmed')) {
                        throw new Error('Please check your email and confirm your account before signing in.')
                    } else if (error.message.includes('Invalid login credentials')) {
                        throw new Error('Invalid email or password. Please try again.')
                    }
                    throw error
                }

                if (signInData.user && !signInData.user.email_confirmed_at) {
                    toast.warning('Please confirm your email address. Check your inbox for the confirmation link.')
                }

                if (signInData.session?.access_token) {
                    setAuthToken(signInData.session.access_token)
                    setAuthUser(signInData.user)
                }

                await fetch('/api/auth/clear-reset-cookies', {
                    method: 'POST'
                }).catch(() => {
                    // Ignore errors
                })

                toast.success('Signed in successfully')
                router.push('/')
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    {isSignUp ? 'Create your account' : 'Sign in to your account'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp)
                            setError(null)
                            if (!isSignUp) {
                                setFirstName('')
                                setLastName('')
                            }
                        }}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        {isSignUp ? 'sign in to existing account' : 'create a new account'}
                    </button>
                    {!isSignUp && (
                        <>
                            {' · '}
                            <a
                                href="/resend-confirmation"
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Resend confirmation email
                            </a>
                        </>
                    )}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleAuth}>
                        {isSignUp && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="firstName"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            First Name
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="firstName"
                                                name="firstName"
                                                type="text"
                                                autoComplete="given-name"
                                                required={isSignUp}
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                placeholder="John"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="lastName"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Last Name
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="lastName"
                                                name="lastName"
                                                type="text"
                                                autoComplete="family-name"
                                                required={isSignUp}
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                {!isSignUp && (
                                    <div className="text-sm">
                                        <a
                                            href="/forgot-password"
                                            className="font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            Forgot password?
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={isSignUp ? "new-password" : "current-password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm">{error}</div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : isSignUp ? 'Sign up' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
