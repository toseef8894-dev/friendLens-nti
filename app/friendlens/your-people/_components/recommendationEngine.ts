import type { Friend } from '../types'

export type RuleId = 'R1' | 'R2' | 'R3' | 'R4'

export interface Recommendation {
  rule_id: RuleId
  score: number
  message: string
}

const MESSAGES: Record<RuleId, string> = {
  R1: 'Add a few more people so FriendLens can give you a clearer read.',
  R2: 'Most friendships should feel good more often than not. Your friend quality may need attention.',
  R3: 'You may not be getting enough invitations. Notice which friendships are not actively including you.',
  R4: 'Add or develop different types of friends so your social life is not too narrow.',
}

const RULE_ORDER: RuleId[] = ['R1', 'R2', 'R3', 'R4']

export function computeRecommendations(friends: Friend[]): Recommendation[] {
  const total = friends.length

  // R1 — Too Few People
  let r1Score = 0
  if (total < 3) r1Score = 100
  else if (total === 3) r1Score = 70

  // Suppress all others if R1 >= 70
  if (r1Score >= 70) {
    return [{ rule_id: 'R1', score: r1Score, message: MESSAGES.R1 }]
  }

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

  const all: Recommendation[] = [
    { rule_id: 'R1' as RuleId, score: r1Score, message: MESSAGES.R1 },
    { rule_id: 'R2' as RuleId, score: r2Score, message: MESSAGES.R2 },
    { rule_id: 'R3' as RuleId, score: r3Score, message: MESSAGES.R3 },
    { rule_id: 'R4' as RuleId, score: r4Score, message: MESSAGES.R4 },
  ]
  const candidates = all.filter((r) => r.score >= 40)

  // Sort descending by score; tie-break by RULE_ORDER
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return RULE_ORDER.indexOf(a.rule_id) - RULE_ORDER.indexOf(b.rule_id)
  })

  return candidates
}
