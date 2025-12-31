'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { toast } from 'sonner'
import { setAuthToken, setAuthUser } from '@/lib/auth-storage'
import Link from 'next/link'

function ResetPasswordForm() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkToken = async () => {
            // Check for hash-based recovery tokens first (from direct email links)
            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            const accessToken = hashParams.get('access_token')
            const type = hashParams.get('type')

            if (accessToken && type === 'recovery') {
                try {
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: hashParams.get('refresh_token') || '',
                    })

                    if (error) {
                        setIsValidToken(false)
                        setError('Invalid or expired reset link. Please request a new one.')
                    } else if (data.session) {
                        setIsValidToken(true)
                    }
                } catch (err) {
                    setIsValidToken(false)
                    setError('Invalid or expired reset link. Please request a new one.')
                }
                return
            }

            // Check for existing session (from code-based flow via auth callback)
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                // Check if this is a recovery session by looking at the URL or session metadata
                // Recovery sessions are temporary and should allow password reset
                const urlParams = new URLSearchParams(window.location.search)
                const recoveryType = urlParams.get('type')
                
                // If we have a session and we're on reset-password page, allow it
                // This handles the case where Supabase created a session from recovery token
                if (recoveryType === 'recovery' || window.location.pathname === '/reset-password') {
                    setIsValidToken(true)
                } else {
                    // If it's a regular session (not recovery), the user shouldn't be here
                    // But we'll still allow them to reset password if they want
                    setIsValidToken(true)
                }
            } else {
                setIsValidToken(false)
                setError('Invalid reset link. Please check your email and try again.')
            }
        }

        checkToken()
    }, [supabase.auth])

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        // Enhanced password validation
        if (password.length < 8) {
            setError('Password must be at least 8 characters long')
            setLoading(false)
            return
        }
        
        // Check for password strength
        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasNumber = /[0-9]/.test(password)
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
        
        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            setError('Password must contain at least one uppercase letter, one lowercase letter, and one number')
            setLoading(false)
            return
        }

        try {
            const { data, error } = await supabase.auth.updateUser({
                password: password,
            })

            if (error) throw error

            if (data.session?.access_token) {
                setAuthToken(data.session.access_token)
                if (data.user) {
                    setAuthUser(data.user)
                }
            }

            setSuccess(true)
            toast.success('Password reset successfully!')

            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } catch (err: any) {
            setError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (isValidToken === null) {
        return (
            <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <p className="text-gray-600">Verifying reset link...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (isValidToken === false) {
        return (
            <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="space-y-4">
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="text-sm text-red-700">
                                    {error || 'Invalid or expired reset link'}
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <Link
                                    href="/forgot-password"
                                    className="block font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Request a new reset link
                                </Link>
                                <Link
                                    href="/login"
                                    className="block text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Back to sign in
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Set new password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your new password below.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {success ? (
                        <div className="space-y-4">
                            <div className="rounded-md bg-green-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-800">
                                            Password reset successful!
                                        </h3>
                                        <div className="mt-2 text-sm text-green-700">
                                            <p>Redirecting to sign in...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    New Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Enter new password"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Confirm New Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Confirm new password"
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
                                    {loading ? 'Resetting...' : 'Reset password'}
                                </button>
                            </div>

                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    Back to sign in
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <p className="text-gray-600">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}

