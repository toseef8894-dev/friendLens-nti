import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/rbac'

export async function DELETE(
    _request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        await requireAdmin()

        const { userId } = params

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user?.id === userId) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            )
        }

        const adminClient = createAdminClient()

        // Check if target user is an admin
        const { data: targetUserRoles } = await adminClient
            .from('user_roles')
            .select(`roles (name)`)
            .eq('user_id', userId)

        const isTargetAdmin = targetUserRoles?.some((ur: any) => ur.roles?.name === 'admin')

        if (isTargetAdmin) {
            return NextResponse.json(
                { error: 'Cannot delete an admin user' },
                { status: 400 }
            )
        }

        // Delete related data from all tables that reference auth.users
        const tablesToClean = [
            { table: 'friends', column: 'user_id' },
            { table: 'responses', column: 'user_id' },
            { table: 'user_roles', column: 'user_id' },
            { table: 'results', column: 'user_id' },
            { table: 'profiles', column: 'id' },
        ]

        for (const { table, column } of tablesToClean) {
            const { error } = await adminClient.from(table).delete().eq(column, userId)
            if (error) {
                console.error(`Failed to delete from ${table}:`, error)
            }
        }

        // Delete the auth user (also handles auth.sessions, auth.refresh_tokens, etc.)
        const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

        if (authError) {
            throw new Error(`Failed to delete user: ${authError.message}`)
        }

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        })

    } catch (error: any) {
        if (error.message === 'Not authenticated') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        if (error.message === 'Admin access required') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        console.error('Delete user error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
