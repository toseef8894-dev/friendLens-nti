/**
 * Your Calendar — Events Recommendation Engine (v1.1, reality-aligned)
 *
 * Spec: docs/EventRecos.txt
 *
 * Available inputs:  role ("hosting" | "invited"), date (timestamp), title (eventName)
 * Forbidden inputs:  attendee list, event size, RSVP state, calendar integration,
 *                    post-event analysis, journaling / "nice job" feedback after save
 *
 * One recommendation shown at a time.
 * Priority order: TRUE_EMPTY → STALE → LOW_HOSTING → HIGH_HOSTING_LOW_INVITES
 *                 → EXPANSION_STREAK → HIGH_HOSTING → HEALTHY_DEFAULT
 *
 * Tone rules:
 *   - No numbers surfaced in UI copy
 *   - No "this week" or live-calendar precision
 *   - No after-the-fact commentary on the last event
 *   - No shame language
 *   - Directional, not diagnostic
 *
 * Minimum sample guard:
 *   Cases HIGH_HOSTING_LOW_INVITES and HIGH_HOSTING require ≥ 3 events.
 *   (Spec body says "Cases 3 and 5" — QA checklist clarifies "Cases 4 and 6".
 *    QA checklist is followed here as it correctly identifies the high-hosting variants.)
 *
 * MIXED_HOSTING (20–50%): intentionally has no dedicated case.
 *   Falls through to EXPANSION_STREAK or HEALTHY_DEFAULT based on other signals.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Subset of CalendarEvent consumed by the engine (field mapping: title←eventName, date←timestamp) */
export interface EventInput {
  id: string
  title: string        // spec: eventName
  role: 'hosting' | 'invited'
  date: string         // ISO date string (YYYY-MM-DD), spec: timestamp
}

export type RecommendationCase =
  | 'TRUE_EMPTY'
  | 'STALE'
  | 'LOW_HOSTING'
  | 'HIGH_HOSTING_LOW_INVITES'
  | 'EXPANSION_STREAK'
  | 'HIGH_HOSTING'
  | 'HEALTHY_DEFAULT'

export interface EventRecommendation {
  case: RecommendationCase
  message: string
  cta: string
}

// ── Keyword lists (Expansion Heuristic) ──────────────────────────────────────

/** Title contains any of these → treat as likely expansion (broad/open plan) */
const EXPANSION_KEYWORDS = [
  'party',
  'bbq',
  'birthday',
  'mixer',
  'gathering',
  'dinner party',
  'event',
  'meetup',
  'group',
]

/** Title contains any of these (and no expansion keyword) → treat as binding/personal */
const BINDING_KEYWORDS = [
  'lunch',
  'coffee',
  'drink',
  'walk',
  'dinner',
]

// ── Canonical copy ────────────────────────────────────────────────────────────

const RECOMMENDATION_COPY: Record<RecommendationCase, { message: string; cta: string }> = {
  TRUE_EMPTY: {
    message: 'Log your first event to start tracking your social momentum.',
    cta: 'Log an event',
  },
  STALE: {
    message: "Your social momentum has slowed. A simple lunch or drink is the easiest way to get it moving again.",
    cta: 'Create an event',
  },
  LOW_HOSTING: {
    message: "You've been joining more than initiating. Start something simple to create more pull.",
    cta: 'Host something simple',
  },
  HIGH_HOSTING_LOW_INVITES: {
    message: "You're putting a lot of energy out. Pause hosting events and give other people a chance to invite you.",
    cta: 'Pause and listen',
  },
  EXPANSION_STREAK: {
    message: "You've been meeting new people. Shift focus to second and third meetings and see if a personal connection develops.",
    cta: 'Plan a follow-up',
  },
  HIGH_HOSTING: {
    message: "You've been hosting consistently and it's coming back to you. Now is a good time to spend time one-on-one with one person.",
    cta: 'Plan a one-on-one',
  },
  HEALTHY_DEFAULT: {
    message: "You have social momentum. Keep it going by balancing invites and invitations, larger events and smaller events, and quality one-on-one events.",
    cta: 'Plan a variety of events',
  },
}

// ── Derived signal helpers (all pure, all null-safe) ──────────────────────────

/** hosting rate = hosted / total */
export function computeHostingRate(events: EventInput[]): number {
  if (!events.length) return 0
  const hosted = events.filter((e) => e.role === 'hosting').length
  return hosted / events.length
}

/** invite rate = invited / total */
export function computeInviteRate(events: EventInput[]): number {
  if (!events.length) return 0
  const invited = events.filter((e) => e.role === 'invited').length
  return invited / events.length
}

/**
 * Days since the most recent event by date.
 * Returns Infinity if events array is empty or all dates are invalid.
 */
export function computeDaysSinceLastEvent(events: EventInput[]): number {
  if (!events.length) return Infinity

  let latestMs = -Infinity
  for (const e of events) {
    try {
      const ms = new Date(e.date).getTime()
      if (!isNaN(ms) && ms > latestMs) latestMs = ms
    } catch {
      // malformed date — skip
    }
  }

  if (latestMs === -Infinity) return Infinity

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffMs = today.getTime() - latestMs
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Returns true if the event title matches an expansion keyword.
 * Expansion keywords take precedence; binding keywords explicitly return false
 * when no expansion keyword is matched.
 */
export function isLikelyExpansion(title: string): boolean {
  if (!title) return false
  const lower = title.toLowerCase()

  for (const kw of EXPANSION_KEYWORDS) {
    if (lower.includes(kw)) return true
  }

  // Binding keywords → explicitly personal/neutral (not expansion)
  for (const kw of BINDING_KEYWORDS) {
    if (lower.includes(kw)) return false
  }

  return false
}

/**
 * Count how many of the most recent `window` events are likely expansion-oriented.
 * Spec: suggested window = 5, threshold = 2+
 */
export function computeExpansionStreak(events: EventInput[], window = 5): number {
  if (!events.length) return 0

  // Sort by date desc to get the most recent first
  const sorted = [...events].sort((a, b) => {
    const aMs = new Date(a.date).getTime()
    const bMs = new Date(b.date).getTime()
    if (isNaN(aMs) && isNaN(bMs)) return 0
    if (isNaN(aMs)) return 1
    if (isNaN(bMs)) return -1
    return bMs - aMs
  })

  const recent = sorted.slice(0, window)
  return recent.filter((e) => isLikelyExpansion(e.title)).length
}

// ── Main engine ───────────────────────────────────────────────────────────────

/**
 * Returns the single highest-priority event recommendation.
 * Never throws — guards against null, empty arrays, and malformed inputs.
 *
 * Priority waterfall (first match wins):
 *   1. TRUE_EMPTY              – no events logged
 *   2. STALE                   – daysSinceLastEvent ≥ 10
 *   3. LOW_HOSTING             – hostingRate < 0.20  (no minimum guard)
 *   4. HIGH_HOSTING_LOW_INVITES – hostingRate > 0.50 && inviteRate < 0.30 && total ≥ 3
 *   5. EXPANSION_STREAK        – ≥ 2 of last 5 events are expansion-type
 *   6. HIGH_HOSTING            – hostingRate > 0.50 && inviteRate ≥ 0.30 && not stale
 *                                && no expansion streak && total ≥ 3
 *   7. HEALTHY_DEFAULT         – catch-all
 */
export function getEventRecommendation(events: EventInput[] | null): EventRecommendation {
  const safeEvents: EventInput[] = Array.isArray(events) ? events : []

  function make(c: RecommendationCase): EventRecommendation {
    return { case: c, ...RECOMMENDATION_COPY[c] }
  }

  // ── Case 1: True Empty ────────────────────────────────────────────────────
  if (safeEvents.length === 0) {
    return make('TRUE_EMPTY')
  }

  const total = safeEvents.length
  const daysSinceLast = computeDaysSinceLastEvent(safeEvents)
  const hostingRate = computeHostingRate(safeEvents)
  const inviteRate = computeInviteRate(safeEvents)
  const expansionStreak = computeExpansionStreak(safeEvents)

  const isStale = daysSinceLast >= 10

  // ── Case 2: Stale ─────────────────────────────────────────────────────────
  if (isStale) {
    return make('STALE')
  }

  // ── Case 3: Low Hosting ───────────────────────────────────────────────────
  // No minimum sample guard for this case.
  if (hostingRate < 0.20) {
    return make('LOW_HOSTING')
  }

  // ── Case 4: High Hosting + Low Invites ────────────────────────────────────
  // Minimum guard: ≥ 3 events required (QA checklist rule).
  if (hostingRate > 0.50 && inviteRate < 0.30 && total >= 3) {
    return make('HIGH_HOSTING_LOW_INVITES')
  }

  // ── Case 5: Expansion Streak ──────────────────────────────────────────────
  if (expansionStreak >= 2) {
    return make('EXPANSION_STREAK')
  }

  // ── Case 6: High Hosting (Balanced) ──────────────────────────────────────
  // Minimum guard: ≥ 3 events required. Must not be stale, no expansion streak issue.
  if (hostingRate > 0.50 && inviteRate >= 0.30 && !isStale && expansionStreak < 2 && total >= 3) {
    return make('HIGH_HOSTING')
  }

  // ── Case 7: Healthy Default ───────────────────────────────────────────────
  return make('HEALTHY_DEFAULT')
}
