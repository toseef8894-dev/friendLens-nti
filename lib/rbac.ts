// lib/rbac.ts
// Role-Based Access Control helpers for FriendLens

import { createClient } from '@/lib/supabase/server'

export type Role = 'admin' | 'user'

/**
 * Get the primary role for a user
 * Returns 'admin' if user has admin role, otherwise 'user'
 */
export async function getUserRole(userId: string): Promise<Role> {
    const supabase = createClient()

    const { data } = await supabase
        .from('user_roles')
        .select(`
      roles (name)
    `)
        .eq('user_id', userId)

    if (!data || data.length === 0) {
        return 'user'
    }

    // Check if any role is admin
    const hasAdmin = data.some((row: any) => row.roles?.name === 'admin')
    return hasAdmin ? 'admin' : 'user'
}

/**
 * Check if a user has admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
    const role = await getUserRole(userId)
    return role === 'admin'
}

/**
 * Get the current authenticated user's role
 */
export async function getCurrentUserRole(): Promise<Role> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return 'user'
    }

    return getUserRole(user.id)
}

/**
 * Check if current user is admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
    const role = await getCurrentUserRole()
    return role === 'admin'
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin(): Promise<void> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const isAdminUser = await isAdmin(user.id)
    if (!isAdminUser) {
        throw new Error('Admin access required')
    }
}

/**
 * Set a user's role (admin only)
 */
export async function setUserRole(userId: string, role: Role): Promise<void> {
    const supabase = createClient()

    // Get role ID
    const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', role)
        .single()

    if (roleError || !roleData) {
        throw new Error(`Role '${role}' not found`)
    }

    // Remove existing roles for user
    await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

    // Assign new role
    const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
            user_id: userId,
            role_id: roleData.id
        })

    if (insertError) {
        throw new Error(`Failed to assign role: ${insertError.message}`)
    }
}
