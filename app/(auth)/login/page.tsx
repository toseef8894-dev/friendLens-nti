'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { setAuthToken, setAuthUser, clearAuthToken } from '@/lib/auth-storage'
import { getPendingAnonymousResults, setPendingAnonymousResults } from '@/lib/storage-utils'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { trackEvent } from '@/lib/analytics'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [loading, setLoading] = useState(false)
    const [oauthBusy, setOauthBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSignUp, setIsSignUp] = useState(false)
    const [signupComplete, setSignupComplete] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)
    const [showSignupGoogleFallback, setShowSignupGoogleFallback] = useState(false)
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
    const errorDescriptionParam = searchParams?.get('error_description')

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
            } else if (errorParam === 'access_denied') {
                errorMessage = 'Google sign-in was canceled.'
            } else if (errorParam === 'invalid_or_expired_link') {
                errorMessage =
                    errorDescriptionParam?.replace(/\+/g, ' ') ||
                    'Invalid or expired confirmation link. Please try again.'
            } else if (errorParam === 'missing_code') {
                errorMessage =
                    errorDescriptionParam?.replace(/\+/g, ' ') ||
                    'The sign-in link is missing required parameters. Please try again.'
            } else if (errorParam === 'oauth_failed' || errorParam === 'server_error') {
                errorMessage =
                    "We couldn't complete Google sign-in. Try email instead."
            }
            if (
                errorParam === 'access_denied' ||
                errorParam === 'oauth_failed' ||
                errorParam === 'server_error'
            ) {
                trackEvent('google_oauth_failed', { reason: errorParam })
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
    }, [errorParam, errorDescriptionParam, confirmedParam, verifiedParam, messageParam])

    useEffect(() => {
        if (!signupComplete) {
            setShowSignupGoogleFallback(false)
            return
        }
        const timer = setTimeout(() => {
            setShowSignupGoogleFallback(true)
        }, 12000)
        return () => clearTimeout(timer)
    }, [signupComplete])

    useEffect(() => {
        if (resendCooldown <= 0) return
        const interval = setInterval(() => {
            setResendCooldown((prev) => Math.max(0, prev - 1))
        }, 1000)
        return () => clearInterval(interval)
    }, [resendCooldown])

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
                    ? `${baseUrl}/auth/callback?save_results=true`
                    : `${baseUrl}/auth/callback`

                trackEvent('signup_started')
                trackEvent('email_signup_submitted')
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
                    trackEvent('email_confirmation_requested')
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
                    router.push('/start-here-1a')
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
                trackEvent('login_success')
                if (typeof window !== 'undefined') {
                    window.history.replaceState({}, '', window.location.pathname)
                }
                router.push('/start-here-1a')
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleResendConfirmation = async () => {
        if (!email || resendCooldown > 0 || resendLoading) return
        setResendLoading(true)
        setError(null)
        trackEvent('resend_confirmation_clicked')
        try {
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: `${baseUrl}/auth/callback`,
                },
            })
            if (error) throw error
            toast.success('Confirmation email sent. Please check your inbox.')
            setResendCooldown(60)
        } catch (err: any) {
            const message = err?.message || 'Could not resend confirmation email.'
            setError(message)
            toast.error(message)
        } finally {
            setResendLoading(false)
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
                            disabled={resendLoading || resendCooldown > 0 || !email}
                            onClick={() => void handleResendConfirmation()}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                        >
                            {resendCooldown > 0
                                ? `Resend in ${resendCooldown}s`
                                : resendLoading
                                  ? 'Sending...'
                                  : 'Resend confirmation email'}
                        </button>
                        {showSignupGoogleFallback ? (
                            <div className="mt-6 border-t border-gray-200 pt-4">
                                <p className="text-sm text-gray-600 mb-3">Having trouble?</p>
                                <GoogleSignInButton
                                    disabled={loading || oauthBusy || resendLoading}
                                    onBusyChange={setOauthBusy}
                                    label="Continue with Google instead - no email required"
                                />
                            </div>
                        ) : null}
                        <div className="mt-4" />
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
                    <GoogleSignInButton
                        disabled={loading || oauthBusy}
                        onBusyChange={setOauthBusy}
                    />
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">or use email</span>
                        </div>
                    </div>
                    <form className="space-y-6" onSubmit={handleAuth}>
                        <fieldset disabled={loading || oauthBusy} className="min-w-0 space-y-6 border-0 p-0 m-0">
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
                            <div className="space-y-2">
                                <div className="text-red-600 text-sm">{error}</div>
                                {(errorParam === 'access_denied' ||
                                  errorParam === 'oauth_failed' ||
                                  errorParam === 'server_error') && (
                                    <div className="text-xs text-gray-600">Use email instead.</div>
                                )}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading || oauthBusy}
                                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : isSignUp ? 'Sign up' : 'Sign in'}
                            </button>
                        </div>
                        </fieldset>
                    </form>
                </div>
                )}
            </div>
        </div>
    )
}
