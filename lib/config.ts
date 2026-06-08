/** Centralised app-wide constants. Import from here instead of scattering literals. */

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/login?signup=true',
    RESULTS: '/results',
    ASSESSMENT: '/assessment',
    POST_LOGIN: '/start-here-1a',
    RESET_PASSWORD: '/reset-password',
    FORGOT_PASSWORD: '/forgot-password',
    FRIENDLENS: '/friendlens',
    YOUR_STYLE: '/friendlens/your-style',
} as const

export const EMAIL = {
    /** Recipient for the contact-form submissions. Set CONTACT_EMAIL in your environment. */
    CONTACT: process.env.CONTACT_EMAIL || 'support@friendlens.ai',
    /** Sender address used for transactional emails. */
    FROM: process.env.EMAIL_FROM || 'FriendLens <results@friendlens.ai>',
    /** Support / reply-to address. */
    SUPPORT_FROM: process.env.SUPPORT_EMAIL_FROM || 'Support <support@friendlens.ai>',
} as const

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://friendlens.ai'

/** Simple RFC-5322-inspired regex — rejects obviously invalid addresses. */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email.trim().toLowerCase())
}
