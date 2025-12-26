// app/api/admin/users/[userId]/role/route.ts
// Admin API - Change user role

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin, setUserRole, Role } from '@/lib/rbac'

export async function PUT(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        // Verify admin access
        await requireAdmin()

        const { userId } = params
        const body = await request.json()
        const { role } = body as { role: Role }

        if (!role || !['admin', 'user'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role. Must be "admin" or "user"' },
                { status: 400 }
            )
        }

        // Prevent changing admin role (admin role cannot be changed)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Check if target user is admin
        const { data: targetUserRoles } = await supabase
            .from('user_roles')
            .select(`
                role_id,
                roles (name)
            `)
            .eq('user_id', userId)

        const isTargetAdmin = targetUserRoles?.some((ur: any) => ur.roles?.name === 'admin')

        if (isTargetAdmin) {
            return NextResponse.json(
                { error: 'Admin role cannot be changed' },
                { status: 400 }
            )
        }

        // Prevent admin from removing their own admin role (additional safety)
        if (user?.id === userId && role !== 'admin') {
            return NextResponse.json(
                { error: 'Cannot remove your own admin role' },
                { status: 400 }
            )
        }

        // Update the role
        await setUserRole(userId, role)

        return NextResponse.json({
            success: true,
            message: `User role updated to ${role}`
        })

    } catch (error: any) {
        if (error.message === 'Not authenticated') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        if (error.message === 'Admin access required') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        console.error('Change role error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
