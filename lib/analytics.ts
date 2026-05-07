export type AnalyticsEventName =
  | 'signup_started'
  | 'google_oauth_started'
  | 'google_oauth_success'
  | 'google_oauth_failed'
  | 'email_signup_submitted'
  | 'email_confirmation_requested'
  | 'email_confirmed'
  | 'login_success'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'resend_confirmation_clicked'
  | 'first_person_added'

export function trackEvent(
  event: AnalyticsEventName,
  props?: Record<string, string | number | boolean | null | undefined>,
) {
  // Replace with real analytics provider later.
  console.log('[analytics]', event, props ?? {})
}
