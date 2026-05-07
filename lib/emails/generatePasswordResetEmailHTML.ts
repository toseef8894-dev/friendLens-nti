/**
 * Password reset email — same visual language as `generateEmailHTML` in
 * `app/api/email/send-results/route.ts` (indigo/purple gradient, card layout).
 *
 * For Supabase Auth templates, pass `{{ .ConfirmationURL }}` as `resetLink`
 * (Supabase substitutes it when sending).
 */

const DEFAULT_SITE = 'https://friendlens.ai'

export function generatePasswordResetEmailHTML(
    resetLink: string,
    options?: { siteUrl?: string },
): { html: string; text: string } {
    const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE
    const year = new Date().getFullYear()

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your FriendLens password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">Reset your password</h1>
                            <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 15px; line-height: 1.5;">FriendLens — secure your account in one step</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 36px 30px;">
                            <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                                We received a request to reset the password for your FriendLens account. Click the button below to choose a new password.
                            </p>
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                This link expires soon. If you did not ask for a reset, you can ignore this email.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 8px 0 24px 0;">
                                        <a href="${resetLink}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Reset password</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                                If the button does not work, copy and paste this link into your browser:<br />
                                <span style="color: #4b5563; word-break: break-all;">${resetLink}</span>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">
                                <a href="${siteUrl}" style="color: #4f46e5; text-decoration: none;">Visit FriendLens</a>
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #6b7280;">© ${year} FriendLens. All rights reserved.</p>
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
Reset your FriendLens password

We received a request to reset the password for your FriendLens account.

Use this link to set a new password:
${resetLink}

If you did not request this, you can ignore this email.

Visit: ${siteUrl}

© ${year} FriendLens. All rights reserved.
`.trim()

    return { html, text }
}

/** Use this as `resetLink` when pasting the HTML body into Supabase Auth email templates. */
export const SUPABASE_PASSWORD_RESET_LINK_PLACEHOLDER = '{{ .ConfirmationURL }}'
