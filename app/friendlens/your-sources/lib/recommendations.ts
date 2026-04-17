/**
 * Your Sources — Recommendation Engine (v2, reality-aligned)
 *
 * Spec: docs/SourcesRecommendations.md
 *
 * Available signals:   sourceType, friendPotential, mappedPeopleCount, peopleCount
 * Forbidden signals:   timesAttended, friendsMetCount, followUpCount,
 *                      repeatInteractionCount, invitationCount,
 *                      organizingInvolvement, lastAttendedAt
 *
 * Max recommendations per source: 4
 * Category order: primary → secondary → rebalance → expand → optimize → advanced → map
 */

import type { SourceWithSignal, Signal } from '../types'

// ── Public types ──────────────────────────────────────────────────────────────

export type FriendPotential = 'higher' | 'medium' | 'lower'
export type SourcePurpose = 'relational' | 'instrumental'

export type RecommendationCategory =
  | 'primary'
  | 'secondary'
  | 'rebalance'
  | 'expand'
  | 'optimize'
  | 'advanced'
  | 'map'

export interface SourceRecommendation {
  id: string
  category: RecommendationCategory
  title: string
  body: string
  priority: number
}

// ── Internal source shape used by the engine ─────────────────────────────────

interface EngineSource {
  id: string
  sourceType: string | null | undefined
  friendPotential: FriendPotential | null
  purpose: SourcePurpose
  mappedPeopleCount: number   // people already linked to this source
  peopleCount: number          // total friends in the user's account
}

// ── Signal → FriendPotential adapter ─────────────────────────────────────────

export function toFriendPotential(signal: Signal): FriendPotential {
  switch (signal) {
    case 'high':   return 'higher'
    case 'medium': return 'medium'
    case 'low':    return 'lower'
  }
}

// ── Purpose inference ─────────────────────────────────────────────────────────

export function inferPurpose(sourceType?: string | null): SourcePurpose {
  if (sourceType === 'Work') return 'instrumental'
  return 'relational'
}

// ── Category order (lower = earlier display) ──────────────────────────────────

export const CATEGORY_ORDER: Record<RecommendationCategory, number> = {
  primary:   1,
  secondary: 2,
  rebalance: 3,
  expand:    4,
  optimize:  5,
  advanced:  6,
  map:       7,
}

// ── Canonical copy — GPS mode: short, directional, action-first ───────────────

export const SOURCE_RECOMMENDATION_COPY: Record<
  RecommendationCategory,
  { title: string; body: string }
> = {
  primary: {
    title: 'Focus relational attention here',
    body: 'Spend more relational focus in this source. It has the highest chance of producing real friendships.',
  },
  secondary: {
    title: 'Move one person to a 1:1 interaction',
    body: 'Pick one person from here and invite them to something smaller, like coffee or lunch.',
  },
  rebalance: {
    title: 'Pull back from this source',
    body: 'Reduce relational focus here and shift toward stronger sources.',
  },
  expand: {
    title: 'Add one new source',
    body: "Find a new source that has a recurring cadence where you'll see the same people again.",
  },
  optimize: {
    title: 'Shift time toward stronger sources',
    body: 'Reallocate time away from lower-potential sources and into stronger ones.',
  },
  advanced: {
    title: 'Step forward here',
    body: 'Organize or host within this source.',
  },
  map: {
    title: 'Map one person to the source now',
    body: 'Map at least one person you have connected with from this source to make your relationality more clear.',
  },
}

// ── Factory ───────────────────────────────────────────────────────────────────

function makeRecommendation(
  sourceId: string,
  category: RecommendationCategory,
): SourceRecommendation {
  const copy = SOURCE_RECOMMENDATION_COPY[category]
  return {
    id: `${sourceId}-${category}`,
    category,
    title: copy.title,
    body: copy.body,
    priority: CATEGORY_ORDER[category],
  }
}

// ── Core engine ───────────────────────────────────────────────────────────────

function getRecommendationsForEngine(src: EngineSource): SourceRecommendation[] {
  const { id, purpose, friendPotential: potential, mappedPeopleCount, peopleCount } = src

  // No recommendations until friendPotential is set OR at least 1 person is mapped
  if (!potential && mappedPeopleCount === 0) return []

  // Instrumental sources: suppress all recommendations
  if (purpose === 'instrumental') return []

  const recs: SourceRecommendation[] = []

  // Primary — higher potential only
  if (potential === 'higher') {
    recs.push(makeRecommendation(id, 'primary'))
  }

  // Secondary — higher or medium
  if (potential === 'higher' || potential === 'medium') {
    recs.push(makeRecommendation(id, 'secondary'))
  }

  // Rebalance — lower potential
  if (potential === 'lower') {
    recs.push(makeRecommendation(id, 'rebalance'))
  }

  // Expand — lower potential
  if (potential === 'lower') {
    recs.push(makeRecommendation(id, 'expand'))
  }

  // Optimize — medium or higher
  if (potential === 'medium' || potential === 'higher') {
    recs.push(makeRecommendation(id, 'optimize'))
  }

  // Advanced — higher potential (aspirational, not state-aware)
  if (potential === 'higher') {
    recs.push(makeRecommendation(id, 'advanced'))
  }

  // Map — people exist in account but none linked to this source yet
  if (peopleCount > 0 && mappedPeopleCount < 1) {
    recs.push(makeRecommendation(id, 'map'))
  }

  // De-duplicate by category
  const deduped = Array.from(
    new Map(recs.map((r) => [r.category, r])).values(),
  )

  // Sort by category order
  deduped.sort((a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category])

  // Max 4 visible
  return deduped.slice(0, 4)
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns up to 4 recommendations for a source.
 * Pass `totalFriendsCount` (all friends the user has) for the `map` trigger.
 */
export function getSourceRecommendations(
  source: SourceWithSignal,
  totalFriendsCount: number,
): SourceRecommendation[] {
  const purpose = inferPurpose(source.source_type)
  const friendPotential = toFriendPotential(source.signal)

  const engineSource: EngineSource = {
    id: source.id,
    sourceType: source.source_type,
    friendPotential,
    purpose,
    mappedPeopleCount: source.associated_people_count,
    peopleCount: totalFriendsCount,
  }

  return getRecommendationsForEngine(engineSource)
}

/**
 * Returns the single strongest CTA to surface after a Step 2 save.
 * Preference order: map → secondary → primary → first available
 */
export function getPrimaryNextAction(
  source: SourceWithSignal,
  totalFriendsCount: number,
): SourceRecommendation | null {
  const recs = getSourceRecommendations(source, totalFriendsCount)
  if (!recs.length) return null
  return (
    recs.find((r) => r.category === 'map') ??
    recs.find((r) => r.category === 'secondary') ??
    recs.find((r) => r.category === 'primary') ??
    recs[0] ??
    null
  )
}
