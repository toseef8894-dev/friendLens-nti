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

// ── Page-level types ──────────────────────────────────────────────────────────

export interface PageLevelRecommendation {
  sourceId?: string | null
  sourceName?: string | null
  title: string
  body?: string
  kind: 'source-scoped' | 'global-diagnostic'
}

// ── Page-level shape (subset of SourceWithSignal used by page helpers) ────────

interface PageSource {
  id: string
  name: string
  sourceType: string | null | undefined
  friendPotential: FriendPotential | null
  mappedPeopleCount: number
  updatedAt: string | null | undefined
}

/**
 * Returns eligible relational sources only.
 * A source is eligible if it has a friendPotential set OR has at least 1 mapped person.
 */
export function getEligibleSources(sources: PageSource[]): PageSource[] {
  return sources.filter((s) => {
    const purpose = inferPurpose(s.sourceType)
    return purpose === 'relational' && (!!s.friendPotential || s.mappedPeopleCount > 0)
  })
}

/**
 * Deterministic source ranking for page-level selection.
 * Order: tier → has mapped people → mapped count → most recently updated → alphabetical
 */
export function rankSourcesForPage(sources: PageSource[]): PageSource[] {
  const tierRank: Record<FriendPotential, number> = { higher: 1, medium: 2, lower: 3 }

  return [...sources].sort((a, b) => {
    const aTier = a.friendPotential ? tierRank[a.friendPotential] : 999
    const bTier = b.friendPotential ? tierRank[b.friendPotential] : 999
    if (aTier !== bTier) return aTier - bTier

    const aHasMapped = a.mappedPeopleCount > 0 ? 1 : 0
    const bHasMapped = b.mappedPeopleCount > 0 ? 1 : 0
    if (aHasMapped !== bHasMapped) return bHasMapped - aHasMapped

    if (a.mappedPeopleCount !== b.mappedPeopleCount) return b.mappedPeopleCount - a.mappedPeopleCount

    const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
    const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
    if (aUpdated !== bUpdated) return bUpdated - aUpdated

    return a.name.localeCompare(b.name)
  })
}

/**
 * Returns a single page-level recommendation derived from the best eligible source.
 * - higher/medium best source  → source-scoped recommendation naming that source
 * - lower-only sources         → global-diagnostic (no source binding)
 * - no eligible sources        → null
 */
export function getPageLevelRecommendation(
  sources: import('../types').SourceWithSignal[],
): PageLevelRecommendation | null {
  const pageSources: PageSource[] = sources.map((s) => ({
    id: s.id,
    name: s.name,
    sourceType: s.source_type,
    friendPotential: s.signalIsSet ? toFriendPotential(s.signal) : null,
    mappedPeopleCount: s.associated_people_count,
    updatedAt: s.updated_at,
  }))

  const eligible = getEligibleSources(pageSources)
  if (!eligible.length) return null

  const ranked = rankSourcesForPage(eligible)
  const best = ranked[0]

  if (best.friendPotential === 'lower' || best.friendPotential === null) {
    return {
      kind: 'global-diagnostic',
      sourceId: null,
      sourceName: null,
      title: 'No strong sources detected',
      body: 'Pull back from weaker sources and add one higher-potential source.',
    }
  }

  return {
    kind: 'source-scoped',
    sourceId: best.id,
    sourceName: best.name,
    title: `Focus relational attention on ${best.name}`,
    body: 'This source currently has the highest chance of producing real friendships.',
  }
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
