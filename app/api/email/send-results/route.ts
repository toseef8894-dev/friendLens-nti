import { NextRequest, NextResponse } from 'next/server'
import { getNTITypeById } from '@/lib/nti-config'
import { ARCHETYPES } from '@/lib/nti-config'
import type { ArchetypeId, DimensionId } from '@/lib/nti-scoring'
import { DIMENSION_IDS } from '@/lib/nti-scoring'

interface EmailRequest {
    email: string
    resultData: {
        archetype_id: string
        microtype_id: string
        microtype_tags: string[]
        user_vector: Record<DimensionId, number>
        nti_type?: {
            name: string
            short_label: string
            description?: string
        }
    }
}

const DIMENSION_LABELS: Record<DimensionId, string> = {
    DA: 'Drive',
    OX: 'Connection',
    '5HT': 'Wisdom',
    ACh: 'Focus',
    EN: 'Joy',
    GABA: 'Calm'
}

async function sendEmailViaService(to: string, html: string, text: string, subject: string) {
    if (process.env.RESEND_API_KEY) {
        try {
            const { Resend } = await import('resend').catch((importError: any) => {
                console.error('Failed to import resend package:', importError)
                throw new Error('Resend package not available. Please ensure "resend" is installed: npm install resend')
            })
            
            if (!Resend) {
                throw new Error('Resend class not found. Please check your resend package installation.')
            }
            
            const resend = new Resend(process.env.RESEND_API_KEY)
            
            const { data, error } = await resend.emails.send({
                from: process.env.EMAIL_FROM || 'FriendLens <results@friendlens.ai>',
                to: [to],
                subject,
                html,
                text,
            })

            if (error) {
                console.error('Resend API error:', error)
                throw new Error(error.message || 'Failed to send email')
            }

            return { success: true, messageId: data?.id }
        } catch (error: any) {
            console.error('Resend send error:', error)
            // Provide more specific error message
            const errorMsg = error.message || String(error) || 'Unknown error'
            if (errorMsg.includes('fetch') || errorMsg.includes('resolve') || errorMsg.includes('Unable to fetch') || errorMsg.includes('ERR_') || errorMsg.includes('MODULE_NOT_FOUND')) {
                throw new Error('Email service unavailable. Please check: 1) Resend package is installed (npm install resend), 2) RESEND_API_KEY is set in .env.local, 3) API key is valid. Error: ' + errorMsg)
            }
            throw error
        }
    }

    // Option 2: Supabase Edge Function
    if (process.env.USE_SUPABASE_EDGE_FUNCTION === 'true' && process.env.SUPABASE_URL) {
        try {
            const supabaseUrl = process.env.SUPABASE_URL
            const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({ to, subject, html, text }),
            })

            if (!response.ok) {
                const error = await response.text()
                throw new Error(error || 'Failed to send email via Supabase Edge Function')
            }

            return { success: true }
        } catch (error: any) {
            console.error('Supabase Edge Function error:', error)
            throw error
        }
    }

    // Option 3: Cloudflare Worker
    if (process.env.USE_CLOUDFLARE_WORKER === 'true' && process.env.CLOUDFLARE_WORKER_EMAIL_URL) {
        try {
            const response = await fetch(process.env.CLOUDFLARE_WORKER_EMAIL_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(process.env.CLOUDFLARE_WORKER_SECRET && {
                        'Authorization': `Bearer ${process.env.CLOUDFLARE_WORKER_SECRET}`,
                    }),
                },
                body: JSON.stringify({ to, subject, html, text }),
            })

            if (!response.ok) {
                throw new Error('Failed to send email via Cloudflare Worker')
            }

            return { success: true }
        } catch (error: any) {
            console.error('Cloudflare Worker error:', error)
            throw error
        }
    }

    // Development: Log email instead of sending
    console.log('='.repeat(60))
    console.log('EMAIL (Development Mode - Not Actually Sent)')
    console.log('='.repeat(60))
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('HTML:', html)
    console.log('='.repeat(60))
    
    return { success: true, development: true }
}

function generateEmailHTML(resultData: EmailRequest['resultData']): { html: string; text: string } {
    const ntiType = resultData.nti_type || getNTITypeById(resultData.archetype_id)
    const primaryArchetypeId = resultData.microtype_id as ArchetypeId
    const secondaryArchetypeId = resultData.microtype_tags?.[1] as ArchetypeId
    const primaryArchetype = ARCHETYPES[primaryArchetypeId]
    const secondaryArchetype = secondaryArchetypeId ? ARCHETYPES[secondaryArchetypeId] : null
    const scores = resultData.user_vector || {}

    if (!ntiType) {
        throw new Error('Unable to generate email: NTI type not found')
    }

    const dimensionRows = DIMENSION_IDS.map(dim => {
        const score = scores[dim] || 0
        const label = DIMENSION_LABELS[dim]
        return `
            <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #374151;">${label}</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px; color: #111827;">${Math.round(score)}</td>
            </tr>
        `
    }).join('')

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Friendship Archetype Results</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Your Friendship Archetype</h1>
                            <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">Discover how you connect and build friendships</p>
                        </td>
                    </tr>
                    
                    <!-- NTI Type -->
                    <tr>
                        <td style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 1px;">Your NTI Type</p>
                            <h2 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: #111827;">${ntiType.name}</h2>
                            <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #7c3aed;">${ntiType.short_label}</p>
                            ${ntiType.description ? `<p style="margin: 0; font-size: 16px; color: #4b5563; line-height: 1.6;">${ntiType.description}</p>` : ''}
                        </td>
                    </tr>
                    
                    <!-- Primary Archetype -->
                    ${primaryArchetype ? `
                    <tr>
                        <td style="padding: 30px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff;">
                            <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Primary Archetype</p>
                            <h3 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">${primaryArchetype.name}</h3>
                            <p style="margin: 0 0 12px 0; font-size: 14px; opacity: 0.9;">${primaryArchetype.tagline}</p>
                            <p style="margin: 0; font-size: 15px; line-height: 1.6; opacity: 0.95;">${primaryArchetype.description}</p>
                        </td>
                    </tr>
                    ` : ''}
                    
                    <!-- Secondary Archetype -->
                    ${secondaryArchetype ? `
                    <tr>
                        <td style="padding: 30px; background-color: #ffffff; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #7c3aed;">Secondary Archetype</p>
                            <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #111827;">${secondaryArchetype.name}</h3>
                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">${secondaryArchetype.tagline}</p>
                            <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.6;">${secondaryArchetype.description}</p>
                        </td>
                    </tr>
                    ` : ''}
                    
                    <!-- Dimension Scores -->
                    <tr>
                        <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                            <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #111827;">Your Dimension Scores</h3>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; padding: 20px;">
                                ${dimensionRows}
                            </table>
                        </td>
                    </tr>
                    
                    <!-- CTA -->
                    <tr>
                        <td style="padding: 30px; text-align: center; background-color: #ffffff; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 20px 0; font-size: 15px; color: #4b5563;">Want to save your results and access them anytime?</p>
                            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://friendlens.ai'}/login?signup=true" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Create Free Account</a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} FriendLens. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim()

    const text = `
Your Friendship Archetype Results

Your NTI Type: ${ntiType.name}
${ntiType.short_label}
${ntiType.description || ''}

${primaryArchetype ? `
Primary Archetype: ${primaryArchetype.name}
${primaryArchetype.tagline}
${primaryArchetype.description}
` : ''}

${secondaryArchetype ? `
Secondary Archetype: ${secondaryArchetype.name}
${secondaryArchetype.tagline}
${secondaryArchetype.description}
` : ''}

Your Dimension Scores:
${DIMENSION_IDS.map(dim => `  ${DIMENSION_LABELS[dim]}: ${Math.round(scores[dim] || 0)}`).join('\n')}

Create a free account to save your results: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://friendlens.ai'}/login?signup=true

© ${new Date().getFullYear()} FriendLens. All rights reserved.
    `.trim()

    return { html, text }
}

export async function POST(request: NextRequest) {
    try {
        const body: EmailRequest = await request.json()
        const { email, resultData } = body

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email address is required' },
                { status: 400 }
            )
        }

        if (!resultData) {
            return NextResponse.json(
                { error: 'Result data is required' },
                { status: 400 }
            )
        }

        const { html, text } = generateEmailHTML(resultData)
        const subject = `Your Friendship Archetype: ${resultData.nti_type?.name || getNTITypeById(resultData.archetype_id)?.name || 'Results'}`

        const emailResult = await sendEmailViaService(email, html, text, subject)

        return NextResponse.json({
            message: 'Email sent successfully',
            ...emailResult
        })

    } catch (error: any) {
        console.error('Email send error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to send email' },
            { status: 500 }
        )
    }
}
