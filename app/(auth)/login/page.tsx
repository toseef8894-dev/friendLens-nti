'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { setAuthToken, setAuthUser, clearAuthToken } from '@/lib/auth-storage'
import { getPendingAnonymousResults, setPendingAnonymousResults } from '@/lib/storage-utils'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSignUp, setIsSignUp] = useState(false)
    const [signupComplete, setSignupComplete] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const errorParam = searchParams?.get('error')
    const confirmedParam = searchParams?.get('confirmed')
    const signupParam = searchParams?.get('signup')
    const verifiedParam = searchParams?.get('verified')
    const messageParam = searchParams?.get('message')

    useEffect(() => {
        if (signupParam === 'true') {
            setIsSignUp(true)
        }
    }, [signupParam])

    useEffect(() => {
        const checkAndClearStaleAuth = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser()
                const { data: { session } } = await supabase.auth.getSession()

                if (error || !user || !session) {
                    await supabase.auth.signOut()
                    clearAuthToken()
                    if (typeof window !== 'undefined') {
                        const pendingResults = getPendingAnonymousResults()
                        localStorage.clear()
                        sessionStorage.clear()
                        if (pendingResults) {
                            try {
                                const parsed = JSON.parse(pendingResults)
                                setPendingAnonymousResults(parsed)
                            } catch (e) {
                                if (typeof window !== 'undefined') {
                                    localStorage.setItem('pending_anonymous_results', pendingResults)
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Error clearing stale auth:', err)
                clearAuthToken()
                if (typeof window !== 'undefined') {
                    const pendingResults = getPendingAnonymousResults()
                    localStorage.clear()
                    sessionStorage.clear()
                    if (pendingResults) {
                        try {
                            const parsed = JSON.parse(pendingResults)
                            setPendingAnonymousResults(parsed)
                        } catch (e) {
                            if (typeof window !== 'undefined') {
                                localStorage.setItem('pending_anonymous_results', pendingResults)
                            }
                        }
                    }
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

        if (verifiedParam === 'true') {
            const message = messageParam || 'Verification complete. Redirecting to login screen.'
            toast.success(message)
            const hasPendingResults = !!getPendingAnonymousResults()
            if (hasPendingResults) {
                console.log('Pending anonymous results detected - will be saved after login')
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errorParam, confirmedParam, verifiedParam, messageParam])

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

                if (password !== confirmPassword) {
                    setError('Passwords do not match')
                    toast.error('Passwords do not match')
                    setLoading(false)
                    return
                }

                const hasPendingResults = !!getPendingAnonymousResults()
                
                const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
                const redirectTo = hasPendingResults 
                    ? `${baseUrl}/auth/callback?next=/&save_results=true`
                    : `${baseUrl}/auth/callback`

                const { data: signupData, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: redirectTo,
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
                    setSignupComplete(true)
                } else if (signupData.session) {
                    if (signupData.session.access_token) {
                        setAuthToken(signupData.session.access_token)
                        setAuthUser(signupData.user)
                    }

                    await fetch('/api/auth/clear-reset-cookies', {
                        method: 'POST'
                    }).catch(() => { })

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
                })

                toast.success('Signed in successfully')
                if (typeof window !== 'undefined') {
                    window.history.replaceState({}, '', window.location.pathname)
                }
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
                            setConfirmPassword('')
                            setShowPassword(false)
                            setShowConfirmPassword(false)
                            if (!isSignUp) {
                                setFirstName('')
                                setLastName('')
                            }
                        }}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        {isSignUp ? 'sign in to existing account' : 'create a new account'}
                    </button>

                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                {signupComplete ? (
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                        <div className="mb-4">
                            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Created!</h3>
                        <p className="text-sm text-gray-700 mb-2">
                            Please activate your account by clicking the link in the email we just sent.
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            If you do not see the email, please also check Other/Spam/Junk folders.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSignupComplete(false)
                                setIsSignUp(false)
                                setFirstName('')
                                setLastName('')
                                setEmail('')
                                setPassword('')
                                setConfirmPassword('')
                            }}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Back to sign in
                        </button>
                    </div>
                ) : (
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
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete={isSignUp ? "new-password" : "current-password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {isSignUp && (
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Confirm Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required={isSignUp}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                                )}
                            </div>
                        )}

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
                )}
            </div>
        </div>
    )
}
