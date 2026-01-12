
const PENDING_RESULTS_KEY = 'pending_anonymous_results'

export function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    
    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift()
        return cookieValue ? decodeURIComponent(cookieValue) : null
    }
    
    return null
}


export function setCookie(
    name: string,
    value: string,
    options: {
        maxAge?: number 
        path?: string
        secure?: boolean
        sameSite?: 'Strict' | 'Lax' | 'None'
    } = {}
): void {
    if (typeof document === 'undefined') return
    
    const {
        maxAge,
        path = '/',
        secure = typeof window !== 'undefined' && window.location.protocol === 'https:',
        sameSite = 'Lax'
    } = options
    
    let cookieString = `${name}=${encodeURIComponent(value)}; path=${path}; SameSite=${sameSite}`
    
    if (maxAge) {
        cookieString += `; max-age=${maxAge}`
    }
    
    if (secure) {
        cookieString += '; Secure'
    }
    
    document.cookie = cookieString
}

export function deleteCookie(name: string, path: string = '/'): void {
    if (typeof document === 'undefined') return
    
    const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
    
    document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    
    // Also try with domain
    if (hostname) {
        document.cookie = `${name}=; path=${path}; domain=${hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    }
}


export function getPendingAnonymousResults(): string | null {
    // Try cookie first (works across tabs)
    const cookieValue = getCookie(PENDING_RESULTS_KEY)
    if (cookieValue) {
        return cookieValue
    }
    
    if (typeof window !== 'undefined') {
        return localStorage.getItem(PENDING_RESULTS_KEY)
    }
    
    return null
}

export function setPendingAnonymousResults(data: unknown): void {
    const jsonString = JSON.stringify(data)
    
    setCookie(PENDING_RESULTS_KEY, jsonString, {
        maxAge: 7200, // 2 hours
        path: '/',
        sameSite: 'Lax',
        secure: typeof window !== 'undefined' && window.location.protocol === 'https:'
    })
    
    if (typeof window !== 'undefined') {
        localStorage.setItem(PENDING_RESULTS_KEY, jsonString)
    }
}

export function clearPendingAnonymousResults(): void {
    deleteCookie(PENDING_RESULTS_KEY)
    
    if (typeof window !== 'undefined') {
        localStorage.removeItem(PENDING_RESULTS_KEY)
    }
}
