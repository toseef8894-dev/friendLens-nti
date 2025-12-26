import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient()

        // Parse request body
        const body = await request.json()
        const { email, password, first_name, last_name } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields: email, password' },
                { status: 400 }
            )
        }

        // Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: first_name?.trim() || null,
                    last_name: last_name?.trim() || null,
                    full_name: first_name && last_name 
                        ? `${first_name.trim()} ${last_name.trim()}`.trim()
                        : null,
                },
            },
        })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        if (!data.user) {
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500 }
            )
        }

        // Create profile in database
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: data.user.id,
                email: data.user.email,
                first_name: data.user.user_metadata?.first_name || null,
                last_name: data.user.user_metadata?.last_name || null,
                full_name: data.user.user_metadata?.full_name || null,
            })

        if (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't fail the signup, profile trigger should handle it
        }

        return NextResponse.json({
            success: true,
            message: 'Account created successfully. Please check your email to confirm.',
            user: {
                id: data.user.id,
                email: data.user.email,
                email_confirmed: data.user.email_confirmed_at !== null,
            }
        })

    } catch (error: any) {
        console.error('Signup API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
