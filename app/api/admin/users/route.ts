import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/rbac'
import { NTI_TYPES, ARCHETYPES } from '@/lib/nti-config'

export async function GET() {
    try {
        await requireAdmin()

        const supabase = createClient()
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name, full_name, created_at')
            .order('created_at', { ascending: false })

        if (profilesError) {
            return NextResponse.json(
                { error: 'Failed to fetch users' },
                { status: 500 }
            )
        }

        const { data: userRoles } = await supabase
            .from('user_roles')
            .select(`
        user_id,
        roles (name)
      `)

        const { data: results } = await supabase
            .from('results')
            .select('user_id, archetype_id, microtype_id, created_at')
            .order('created_at', { ascending: false })

        const roleMap = new Map<string, string>()
        userRoles?.forEach((ur: any) => {
            const existing = roleMap.get(ur.user_id)
            if (ur.roles?.name === 'admin' || !existing) {
                roleMap.set(ur.user_id, ur.roles?.name || 'user')
            }
        })

        const resultMap = new Map<string, any>()
        results?.forEach((r: any) => {
            if (!resultMap.has(r.user_id)) {
                resultMap.set(r.user_id, r)
            }
        })

        const users = profiles?.map(profile => {
            const result = resultMap.get(profile.id)
            const ntiType = result ? NTI_TYPES.find(t => t.id === result.archetype_id) : null
            const archetype = result ? ARCHETYPES[result.microtype_id as keyof typeof ARCHETYPES] : null

            return {
                id: profile.id,
                email: profile.email,
                first_name: profile.first_name,
                last_name: profile.last_name,
                full_name: profile.full_name,
                role: roleMap.get(profile.id) || 'user',
                created_at: profile.created_at,
                result: result ? {
                    nti_type: ntiType?.name || null,
                    nti_type_label: ntiType?.short_label || null,
                    archetype: archetype?.name || null,
                    archetype_tagline: archetype?.tagline || null,
                    assessed_at: result.created_at
                } : null
            }
        })

        return NextResponse.json({ users })

    } catch (error: any) {
        if (error.message === 'Not authenticated') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        if (error.message === 'Admin access required') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        console.error('Admin users error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
