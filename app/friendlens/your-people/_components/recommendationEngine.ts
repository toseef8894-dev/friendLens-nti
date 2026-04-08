import type { Friend } from '../types'

export type RuleId = 'R1' | 'R2' | 'R3' | 'R4'
export type FallbackId =
  | 'fallback-made-happy'
  | 'fallback-miss-them'
  | 'fallback-not-contacted-you'
  | 'fallback-not-invited-you'
  | 'fallback-relationship-mix'
export type RecoId = RuleId | FallbackId

export interface Recommendation {
  id: RecoId
  rule_id?: RuleId
  type: 'primary' | 'fallback'
  score: number
  priority: number
  title: string
  observation: string
  meaning: string
  direction: string
}

const MAX_RECOMMENDATIONS = 4

// ─── Person Scoring ───────────────────────────────────────────────────────────

function relationshipScore(r: string): number {
  switch (r) {
    case 'Best Friend': return 3
    case 'Close Friend': return 2
    case 'Friend': return 1
    default: return 0
  }
}

function personScore(f: Friend): number {
  return (
    (f.did_they_invite_you ? 2 : 0) +
    (f.made_you_happier ? 2 : 0) +
    relationshipScore(f.relationship_type ?? '')
  )
}

// ─── Callout Detection ────────────────────────────────────────────────────────

function getCallouts(people: Friend[]): { top: Friend | null; bottom: Friend | null } {
  if (people.length < 3) return { top: null, bottom: null }

  const sorted = [...people].sort((a, b) => personScore(b) - personScore(a))
  const top = sorted[0]
  const second = sorted[1]
  const bottom = sorted[sorted.length - 1]

  const topScore = personScore(top)
  const secondScore = personScore(second)
  const bottomScore = personScore(bottom)

  const strongTop = topScore >= 4
  const clearLeader = (topScore - secondScore) >= 2
  const weakBottom = bottomScore <= 1
  const clearLag = (secondScore - bottomScore) >= 2

  return {
    top: (strongTop && clearLeader) ? top : null,
    bottom: (weakBottom && clearLag) ? bottom : null,
  }
}

// ─── Primary Recommendation Builder ──────────────────────────────────────────

const PRIMARY_TITLES: Record<RuleId, string> = {
  R1: 'Your list is still small',
  R2: 'Happiness signal is low',
  R3: 'You are not getting many invitations',
  R4: 'Your relationship mix is narrow',
}

const RULE_ORDER: RuleId[] = ['R1', 'R2', 'R3', 'R4']

function buildRecommendation(
  ruleId: RuleId,
  score: number,
  people: Friend[],
  usedNames: Set<string>
): Recommendation {
  const { top, bottom } = getCallouts(people)

  const base = {
    id: ruleId as RecoId,
    rule_id: ruleId,
    type: 'primary' as const,
    score,
    priority: score,
    title: PRIMARY_TITLES[ruleId],
  }

  switch (ruleId) {
    case 'R1':
      return {
        ...base,
        observation: "You've only added a few people.",
        meaning: 'Your friendship picture is still too early to read.',
        direction: 'Add 2–3 more people so patterns can emerge.',
      }

    case 'R2':
      if (top) {
        usedNames.add(top.name)
        return {
          ...base,
          observation: `${top.name} stands out as more positive than the others right now.`,
          meaning: 'Most of your current friendships are not consistently making you happy.',
          direction: 'Put more weight on relationships like this.',
        }
      }
      if (bottom) {
        usedNames.add(bottom.name)
        return {
          ...base,
          observation: `${bottom.name} looks early or unproven compared to the others.`,
          meaning: 'Some of these friendships may not be creating real positive signal yet.',
          direction: "Don't over-invest until you see more consistency.",
        }
      }
      return {
        ...base,
        observation: 'Not many of these friendships are marked as making you happy.',
        meaning: 'Your current friend quality may be lower than it looks.',
        direction: 'Put more weight on the people who reliably make you feel good.',
      }

    case 'R3':
      if (top) {
        usedNames.add(top.name)
        return {
          ...base,
          observation: `${top.name} is one of the few actively including you.`,
          meaning: 'You may be carrying more of the social effort elsewhere.',
          direction: 'Notice who includes you without needing a push.',
        }
      }
      if (bottom) {
        usedNames.add(bottom.name)
        return {
          ...base,
          observation: `${bottom.name} shows little invitation signal right now.`,
          meaning: 'Some relationships may not be actively including you.',
          direction: 'Be mindful of where the effort is not mutual.',
        }
      }
      return {
        ...base,
        observation: "You're not getting many invitations from these people.",
        meaning: 'You may be carrying more of the social effort than they are.',
        direction: 'Notice who includes you without needing a push.',
      }

    case 'R4':
      return {
        ...base,
        observation: 'Most of your friendships are the same type.',
        meaning: 'Your social world may be narrower than it could be.',
        direction: 'Develop a mix of friend types for a more balanced social life.',
      }
  }
}

// ─── Fallback Recommendation Builder ─────────────────────────────────────────

function getFallbackRecommendations(
  friends: Friend[],
  usedNames: Set<string>
): Recommendation[] {
  const recos: Recommendation[] = []

  // Helper: pick up to 3 names not already used, then mark them used
  function pickNames(pool: Friend[], max = 3): string {
    const picked: string[] = []
    for (const f of pool) {
      if (picked.length >= max) break
      if (!usedNames.has(f.name)) {
        picked.push(f.name)
        usedNames.add(f.name)
      }
    }
    return picked.join(', ')
  }

  // fallback-made-happy (priority 10)
  const madeHappy = friends.filter((f) => f.made_you_happier === true)
  if (madeHappy.length > 0) {
    const names = pickNames(madeHappy)
    const nameSuffix = names ? `, such as ${names}` : ''
    recos.push({
      id: 'fallback-made-happy',
      type: 'fallback',
      score: 0,
      priority: 10,
      title: 'Notice who lifts your mood',
      observation: `${madeHappy.length} ${madeHappy.length === 1 ? 'person is' : 'people are'} marked as making you happy. Consider investing a bit more in the strongest ones${nameSuffix}.`,
      meaning: 'These are the relationships with the most consistent positive signal.',
      direction: 'Notice who lifts your mood.',
    })
  }

  // fallback-miss-them (priority 9)
  const missThem = friends.filter((f) => f.do_you_miss_them === true)
  if (missThem.length > 0) {
    const names = pickNames(missThem)
    const nameClause = names ? `A simple check-in with ${names} could help revive a promising connection.` : 'A simple check-in could help revive a promising connection.'
    recos.push({
      id: 'fallback-miss-them',
      type: 'fallback',
      score: 0,
      priority: 9,
      title: 'Some friendships may be ready for renewal',
      observation: `${missThem.length} ${missThem.length === 1 ? 'person is' : 'people are'} marked as people you miss. ${nameClause}`,
      meaning: 'Missing someone is a signal that the relationship still has energy worth preserving.',
      direction: 'Some friendships may be ready for renewal.',
    })
  }

  // fallback-not-contacted-you (priority 8) — no names
  const notContacted = friends.filter((f) => f.did_they_contact_you !== true)
  if (notContacted.length > 0) {
    recos.push({
      id: 'fallback-not-contacted-you',
      type: 'fallback',
      score: 0,
      priority: 8,
      title: 'Watch for one-way momentum',
      observation: `${notContacted.length} ${notContacted.length === 1 ? 'person has' : 'people have'} not contacted you. Use this to spot where the relationship may be running mostly on your energy.`,
      meaning: 'One-way contact is not always a problem, but it is worth noticing at scale.',
      direction: 'Watch for one-way momentum.',
    })
  }

  // fallback-not-invited-you (priority 7) — no names
  const notInvited = friends.filter((f) => f.did_they_invite_you !== true)
  if (notInvited.length > 0) {
    recos.push({
      id: 'fallback-not-invited-you',
      type: 'fallback',
      score: 0,
      priority: 7,
      title: 'Invitation patterns matter',
      observation: `${notInvited.length} ${notInvited.length === 1 ? 'person has' : 'people have'} not invited you yet. That does not make them bad friends, but it can help clarify where reciprocity is still early or limited.`,
      meaning: 'Invitation patterns tell you something about who is actively pulling you into their world.',
      direction: 'Invitation patterns matter.',
    })
  }

  // fallback-relationship-mix (priority 6) — skip if no types set
  const withType = friends.filter((f) => f.relationship_type != null)
  if (withType.length > 0) {
    const counts = withType.reduce<Record<string, number>>((acc, f) => {
      const key = f.relationship_type!
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    recos.push({
      id: 'fallback-relationship-mix',
      type: 'fallback',
      score: 0,
      priority: 6,
      title: 'Your relationship mix is becoming visible',
      observation: `You currently have the most people in "${top[0]}" (${top[1]}). Sorting by relationship type may help you see where your social energy is concentrated.`,
      meaning: 'A view of your relationship mix can reveal whether your social world is diversified or concentrated.',
      direction: 'Your relationship mix is becoming visible.',
    })
  }

  return recos
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function computeRecommendations(friends: Friend[]): Recommendation[] {
  const total = friends.length
  const usedNames = new Set<string>()

  // ── Stage A: primary rules ──────────────────────────────────────────────────

  // R1 — Too Few People
  let r1Score = 0
  if (total < 3) r1Score = 100
  else if (total === 3) r1Score = 70

  // NOTE: R1 no longer causes an early return — fallbacks fill remaining slots

  const happy_count = friends.filter((f) => f.made_you_happier === true).length
  const happy_ratio = total > 0 ? happy_count / total : 0

  const invited_count = friends.filter((f) => f.did_they_invite_you === true).length
  const invited_ratio = total > 0 ? invited_count / total : 0

  const type_count = new Set(
    friends.map((f) => f.relationship_type).filter(Boolean)
  ).size

  // R2 — Low Happiness
  let r2Score = 0
  if (happy_ratio < 0.4) r2Score = 85
  else if (happy_ratio < 0.6) r2Score = 65

  // R3 — Low Invitations
  let r3Score = 0
  if (invited_ratio < 0.3) r3Score = 75
  else if (invited_ratio < 0.5) r3Score = 55

  // R4 — Low Type Diversity
  let r4Score = 0
  if (type_count < 2) r4Score = 60
  else if (type_count < 3) r4Score = 40

  const candidates = [
    { id: 'R1' as RuleId, score: r1Score },
    { id: 'R2' as RuleId, score: r2Score },
    { id: 'R3' as RuleId, score: r3Score },
    { id: 'R4' as RuleId, score: r4Score },
  ]
    .filter((r) => r.score >= 40)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return RULE_ORDER.indexOf(a.id) - RULE_ORDER.indexOf(b.id)
    })

  const primaries = candidates.map((r) =>
    buildRecommendation(r.id, r.score, friends, usedNames)
  )

  // ── Stage B: fill remaining slots with fallbacks ────────────────────────────

  if (primaries.length < MAX_RECOMMENDATIONS) {
    const fallbacks = getFallbackRecommendations(friends, usedNames)
      .sort((a, b) => b.priority - a.priority)

    const usedIds = new Set(primaries.map((r) => r.id))

    for (const fb of fallbacks) {
      if (primaries.length >= MAX_RECOMMENDATIONS) break
      if (usedIds.has(fb.id)) continue
      primaries.push(fb)
      usedIds.add(fb.id)
    }
  }

  return primaries.slice(0, MAX_RECOMMENDATIONS)
}