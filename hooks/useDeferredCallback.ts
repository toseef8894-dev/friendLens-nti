'use client'

import { useCallback } from 'react'


export function useDeferredCallback() {
    const defer = useCallback((
        callback: () => void | Promise<void>,
        options?: { timeout?: number; immediate?: boolean }
    ) => {
        const { timeout = 2000, immediate = false } = options || {}

        if (immediate) {
            if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
                requestIdleCallback(callback as () => void, { timeout })
            } else {
                setTimeout(callback as () => void, Math.min(timeout, 100))
            }
        } else {
            if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
                requestIdleCallback(callback as () => void, { timeout })
            } else {
                setTimeout(callback as () => void, 100)
            }
        }
    }, [])

    return { defer }
}
