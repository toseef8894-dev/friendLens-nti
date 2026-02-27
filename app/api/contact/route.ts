import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, message } = body

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
        }

        if (!message || message.trim().length < 5) {
            return NextResponse.json({ error: 'Please include a message.' }, { status: 400 })
        }

        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY not set')
            return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 })
        }

        const resend = new Resend(process.env.RESEND_API_KEY)

        await resend.emails.send({
            from: process.env.SUPPORT_EMAIL_FROM || 'Support <support@friendlens.ai>',
            to: ['toseef8894@gmail.com'],
            replyTo: email,
            subject: `Contact: ${name ? name : email}`,
            text: [
                `From: ${name ? `${name} <${email}>` : email}`,
                '',
                message.trim(),
            ].join('\n'),
            html: `
                <p><strong>From:</strong> ${name ? `${name} &lt;${email}&gt;` : email}</p>
                <hr />
                <p style="white-space:pre-wrap">${message.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            `,
        })

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Contact form error:', err)
        return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
    }
}