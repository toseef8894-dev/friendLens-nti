import { createClient } from '@/lib/supabase/server'

export type Role = 'admin' | 'user'

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

    const hasAdmin = data.some((row: any) => row.roles?.name === 'admin')
    return hasAdmin ? 'admin' : 'user'
}

export async function isAdmin(userId: string): Promise<boolean> {
    const role = await getUserRole(userId)
    return role === 'admin'
}

export async function getCurrentUserRole(): Promise<Role> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return 'user'
    }

    return getUserRole(user.id)
}

export async function isCurrentUserAdmin(): Promise<boolean> {
    const role = await getCurrentUserRole()
    return role === 'admin'
}

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

export async function setUserRole(userId: string, role: Role): Promise<void> {
    const supabase = createClient()

    const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', role)
        .single()

    if (roleError || !roleData) {
        throw new Error(`Role '${role}' not found`)
    }

    await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

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
