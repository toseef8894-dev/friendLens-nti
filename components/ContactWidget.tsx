'use client'

import { useState } from 'react'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function ContactWidget() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [status, setStatus] = useState<Status>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setStatus('sending')
        setErrorMsg('')

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
            })

            const data = await res.json()

            if (!res.ok) {
                setErrorMsg(data.error || 'Something went wrong.')
                setStatus('error')
                return
            }

            setStatus('sent')
            setName('')
            setEmail('')
            setMessage('')
        } catch {
            setErrorMsg('Something went wrong. Please try again.')
            setStatus('error')
        }
    }

    return (
        <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-gray-100">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                    Contact Us
                </h2>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Have a question, concern, or suggestion?{' '}
                    <span className="text-gray-800 font-medium">We read every message.</span>
                </p>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                    FriendLens is intentionally small and thoughtful. If something feels unclear, off, or worth improving, we want to hear it.
                </p>
            </div>

            {/* Form or Success */}
            <div className="px-6 sm:px-8 py-6">
                {status === 'sent' ? (
                    <div className="py-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <p className="text-gray-900 font-semibold text-lg mb-1">Message sent.</p>
                        <p className="text-gray-500 text-sm">We'll respond personally — usually within a day or two.</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-5 text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors"
                        >
                            Send another message
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Name <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <input
                                id="contact-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email
                            </label>
                            <input
                                id="contact-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Message
                            </label>
                            <textarea
                                id="contact-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="What's on your mind?"
                                required
                                rows={5}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors resize-none"
                            />
                        </div>

                        {/* Error */}
                        {status === 'error' && (
                            <p className="text-red-600 text-sm">{errorMsg}</p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full sm:w-auto sm:self-start px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {status === 'sending' ? 'Sending…' : 'Send Message'}
                        </button>

                        {/* Footer note */}
                        <div className="pt-2 border-t border-gray-100 space-y-1">
                            <p className="text-gray-500 text-xs leading-relaxed">
                                We'll respond personally. No bots. No sales outreach.
                            </p>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                Your message goes directly to the founder. We don't share or sell contact information.
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}