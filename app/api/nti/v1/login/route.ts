import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient()

        // Parse request body
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields: email, password' },
                { status: 400 }
            )
        }

        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            )
        }

        if (!data.user || !data.session) {
            return NextResponse.json(
                { error: 'Login failed' },
                { status: 401 }
            )
        }

        // Update last login in profile
        await supabase
            .from('profiles')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', data.user.id)

        return NextResponse.json({
            success: true,
            message: 'Logged in successfully',
            user: {
                id: data.user.id,
                email: data.user.email,
            },
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
            }
        })

    } catch (error: any) {
        console.error('Login API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
