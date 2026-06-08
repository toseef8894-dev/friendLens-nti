'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ProtectedError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Protected route error:', error)
    }, [error])

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-fixed flex items-center justify-center"
            style={{ backgroundImage: "url('/bgImage.png')" }}
        >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full mx-4 text-center space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
                <p className="text-gray-500 text-sm">
                    An unexpected error occurred. Please try again or return home.
                </p>
                <div className="flex gap-3 justify-center pt-2">
                    <button
                        onClick={reset}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-semibold hover:shadow-lg transition-shadow"
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    )
}
