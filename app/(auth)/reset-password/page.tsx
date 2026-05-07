'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()
    
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isValid, setIsValid] = useState<boolean | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const verifyResetToken = async () => {
            setError(null)

            const errorParam = searchParams.get('error')
            if (errorParam === 'invalid_or_expired_link') {
                setIsValid(false)
                setError('Invalid or expired reset link. Please request a new one.')
                return
            }

            const code = searchParams.get('code')
            if (code) {
                window.location.href = `/auth/callback?code=${code}&next=/reset-password`
                return
            }

            try {
                const response = await fetch('/api/auth/validate-reset-token')
                
                if (response.ok) {
                    const data = await response.json()
                    if (data.valid) {
                        setIsValid(true)
                        return
                    }
                }
            } catch (err) {
                // handle validation errors
            }

            if (document.referrer.includes('/auth/callback') || document.referrer.includes('supabase.co')) {
                await new Promise(resolve => setTimeout(resolve, 500))
                
                try {
                    const response = await fetch('/api/auth/validate-reset-token')
                    
                    if (response.ok) {
                        const data = await response.json()
                        if (data.valid) {
                            setIsValid(true)
                            return
                        }
                    }
                } catch (err) {
                    // handle validation errors
                }
            }
            
            setIsValid(false)
            setError('Invalid or expired reset link. Please request a new one.')
        }

        verifyResetToken()
    }, [searchParams])

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long')
            setLoading(false)
            return
        }

        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasNumber = /[0-9]/.test(password)

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            setError('Password must contain at least one uppercase letter, one lowercase letter, and one number')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update password')
            }

            setSuccess(true)
            setLoading(false)
            toast.success('Password reset successfully!')
            
            setTimeout(() => {
                window.location.href = '/login'
            }, 2000)
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update password')
            toast.error(err?.message ?? 'Failed to update password')
            setLoading(false)
        }
    }

    if (isValid === null) {
        return (
            <AuthShell>
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm py-7 px-6 sm:px-10 text-center">
                    <p className="text-[#45556C]">Verifying reset link...</p>
                </div>
            </AuthShell>
        )
    }

    if (isValid === false) {
        return (
            <AuthShell
                title={<><span className="text-[#0F172B]">Link </span><span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">expired</span></>}
                subtitle="Please request a new password reset link."
            >
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm py-6 px-6 sm:py-7 sm:px-10">
                    <div className="space-y-4">
                        <div className="rounded-lg bg-red-50/80 backdrop-blur-sm border border-red-100 p-3">
                            <div className="text-sm text-red-700">
                                {error || 'Invalid or expired reset link'}
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <Link
                                href="/forgot-password"
                                className="block font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                            >
                                Request a new reset link
                            </Link>
                            <Link
                                href="/login"
                                className="block text-sm text-[#62748E] hover:text-[#0F172B] transition-colors"
                            >
                                Back to sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthShell>
        )
    }

    return (
        <AuthShell
            title={<><span className="text-[#0F172B]">Set new </span><span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">password</span></>}
            subtitle="Enter your new password below."
        >
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm py-6 px-6 sm:py-7 sm:px-10">
                {success ? (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-green-50/80 backdrop-blur-sm border border-green-100 p-4">
                            <h3 className="text-sm font-semibold text-green-800">
                                Password reset successful!
                            </h3>
                            <p className="mt-1.5 text-sm text-green-700">
                                Your password has been updated successfully. Redirecting to login...
                            </p>
                        </div>
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleResetPassword}>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-[#0F172B]"
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
                                    className="block w-full appearance-none rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-[#0F172B] placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm transition-colors"
                                    placeholder="Enter new password"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-[#0F172B]"
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
                                    className="block w-full appearance-none rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-[#0F172B] placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm transition-colors"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-50/80 backdrop-blur-sm border border-red-100 p-3">
                                <div className="text-red-700 text-sm">{error}</div>
                            </div>
                        )}

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:hover:shadow-sm"
                            >
                                {loading ? 'Resetting...' : 'Reset password'}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                            >
                                Back to sign in
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </AuthShell>
    )
}

function AuthShell({
    children,
    title,
    subtitle,
}: {
    children: React.ReactNode
    title?: React.ReactNode
    subtitle?: string
}) {
    return (
        <div
            className="w-full flex-1 bg-cover bg-center bg-fixed flex items-center justify-center px-4 py-6 sm:py-10"
            style={{ backgroundImage: "url('/bgImage.png')" }}
        >
            <div className="w-full max-w-md">
                {title && (
                    <div className="text-center mb-5 sm:mb-6">
                        <h2
                            className="text-3xl sm:text-4xl font-semibold tracking-tight"
                            style={{ letterSpacing: '-1px' }}
                        >
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-2 text-sm text-[#45556C]">{subtitle}</p>
                        )}
                    </div>
                )}
                {children}
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <AuthShell>
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm py-7 px-6 sm:px-10 text-center">
                    <p className="text-[#45556C]">Loading...</p>
                </div>
            </AuthShell>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
