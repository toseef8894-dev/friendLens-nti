'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
            const redirectTo = `${siteUrl}/auth/callback?next=/reset-password`
            const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

            if (error) throw error

            trackEvent('password_reset_requested')
            setSuccess(true)
            toast.success('Password reset email sent! Check your inbox.')
        } catch (err: any) {
            setError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="w-full flex-1 bg-cover bg-center bg-fixed flex items-center justify-center px-4 py-6 sm:py-10"
            style={{ backgroundImage: "url('/bgImage.png')" }}
        >
            <div className="w-full max-w-md">
                <div className="text-center mb-5 sm:mb-6">
                    <h2
                        className="text-3xl sm:text-4xl font-semibold tracking-tight"
                        style={{ letterSpacing: '-1px' }}
                    >
                        <span className="text-[#0F172B]">Reset your </span>
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            password
                        </span>
                    </h2>
                    <p className="mt-2 text-sm text-[#45556C]">
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm py-6 px-6 sm:py-7 sm:px-10">
                    {success ? (
                        <div className="space-y-4">
                            <div className="rounded-xl bg-green-50/80 backdrop-blur-sm border border-green-100 p-4">
                                <h3 className="text-sm font-semibold text-green-800">
                                    Check your email
                                </h3>
                                <p className="mt-1.5 text-sm text-green-700">
                                    We&apos;ve sent a password reset link to <strong>{email}</strong>.
                                    Click the link in the email to reset your password.
                                </p>
                            </div>
                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                >
                                    Back to sign in
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-4" onSubmit={handleResetPassword}>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-[#0F172B]"
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
                                        className="block w-full appearance-none rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-[#0F172B] placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm transition-colors"
                                        placeholder="you@example.com"
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
                                    {loading ? 'Sending...' : 'Send reset link'}
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
            </div>
        </div>
    )
}

