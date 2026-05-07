'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ResendConfirmationPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleResendConfirmation = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback?type=signup`,
                },
            })

            if (error) throw error

            setSuccess(true)
            toast.success('Confirmation email sent! Check your inbox.')
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
                        <span className="text-[#0F172B]">Resend </span>
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            confirmation
                        </span>
                    </h2>
                    <p className="mt-2 text-sm text-[#45556C]">
                        Enter your email address and we&apos;ll send you a new confirmation link.
                    </p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm py-6 px-6 sm:py-7 sm:px-10">
                    {success ? (
                        <div className="space-y-4">
                            <div className="rounded-xl bg-green-50/80 backdrop-blur-sm border border-green-100 p-4">
                                <h3 className="text-sm font-semibold text-green-800">
                                    Email sent
                                </h3>
                                <p className="mt-1.5 text-sm text-green-700">
                                    We&apos;ve sent a confirmation link to <strong>{email}</strong>.
                                    Click the link in the email to confirm your account.
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
                        <form className="space-y-4" onSubmit={handleResendConfirmation}>
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
                                    {loading ? 'Sending...' : 'Send confirmation email'}
                                </button>
                            </div>

                            <div className="text-center space-y-2">
                                <Link
                                    href="/login"
                                    className="block text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                >
                                    Back to sign in
                                </Link>
                                <Link
                                    href="/forgot-password"
                                    className="block text-xs text-[#62748E] hover:text-[#0F172B] transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

