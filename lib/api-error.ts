/**
 * Returns a human-readable message from any thrown value.
 * Safe to use in catch blocks typed as `unknown`.
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    return 'An unexpected error occurred'
}

/**
 * Returns an error message safe to send to the client.
 * In production, internal details are hidden; in development the real message is shown.
 */
export function sanitizeErrorForClient(error: unknown): string {
    if (process.env.NODE_ENV !== 'production') {
        return getErrorMessage(error)
    }
    return 'Something went wrong. Please try again.'
}

/**
 * Standard cookie options for the has_results flag.
 * httpOnly prevents JS access; secure ensures HTTPS-only in production.
 */
export const HAS_RESULTS_COOKIE = {
    name: 'has_results',
    value: '1',
    options: {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax' as const,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    },
} as const
