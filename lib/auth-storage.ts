const AUTH_TOKEN_KEY = 'friendlens_auth_token'
const AUTH_USER_KEY = 'friendlens_auth_user'

export function setAuthToken(token: string) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, token)
    }
}

export function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(AUTH_TOKEN_KEY)
    }
    return null
}

export function clearAuthToken() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(AUTH_USER_KEY)
    }
}

export function setAuthUser(user: any) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    }
}

export function getAuthUser(): any | null {
    if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem(AUTH_USER_KEY)
        if (userStr) {
            try {
                return JSON.parse(userStr)
            } catch {
                return null
            }
        }
    }
    return null
}

