import type { Friend } from '../types'

export type RuleId = 'R1' | 'R2' | 'R3' | 'R4'

export interface Recommendation {
  rule_id: RuleId
  score: number
  observation: string
  meaning: string
  direction: string
}

const RULE_ORDER: RuleId[] = ['R1', 'R2', 'R3', 'R4']

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

// ─── Recommendation Builder ───────────────────────────────────────────────────

function buildRecommendation(ruleId: RuleId, score: number, people: Friend[]): Recommendation {
  const { top, bottom } = getCallouts(people)

  switch (ruleId) {
    case 'R1':
      return {
        rule_id: 'R1',
        score,
        observation: "You've only added a few people.",
        meaning: 'Your friendship picture is still too early to read.',
        direction: 'Add 2–3 more people so patterns can emerge.',
      }

    case 'R2':
      if (top) {
        return {
          rule_id: 'R2',
          score,
          observation: `${top.name} stands out as more positive than the others right now.`,
          meaning: 'Most of your current friendships are not consistently making you happy.',
          direction: 'Put more weight on relationships like this.',
        }
      }
      if (bottom) {
        return {
          rule_id: 'R2',
          score,
          observation: `${bottom.name} looks early or unproven compared to the others.`,
          meaning: 'Some of these friendships may not be creating real positive signal yet.',
          direction: "Don't over-invest until you see more consistency.",
        }
      }
      return {
        rule_id: 'R2',
        score,
        observation: 'Not many of these friendships are marked as making you happy.',
        meaning: 'Your current friend quality may be lower than it looks.',
        direction: 'Put more weight on the people who reliably make you feel good.',
      }

    case 'R3':
      if (top) {
        return {
          rule_id: 'R3',
          score,
          observation: `${top.name} is one of the few actively including you.`,
          meaning: 'You may be carrying more of the social effort elsewhere.',
          direction: 'Notice who includes you without needing a push.',
        }
      }
      if (bottom) {
        return {
          rule_id: 'R3',
          score,
          observation: `${bottom.name} shows little invitation signal right now.`,
          meaning: 'Some relationships may not be actively including you.',
          direction: 'Be mindful of where the effort is not mutual.',
        }
      }
      return {
        rule_id: 'R3',
        score,
        observation: "You're not getting many invitations from these people.",
        meaning: 'You may be carrying more of the social effort than they are.',
        direction: 'Notice who includes you without needing a push.',
      }

    case 'R4':
      return {
        rule_id: 'R4',
        score,
        observation: 'Most of your friendships are the same type.',
        meaning: 'Your social world may be narrower than it could be.',
        direction: 'Develop a mix of friend types for a more balanced social life.',
      }
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function computeRecommendations(friends: Friend[]): Recommendation[] {
  const total = friends.length

  // R1 — Too Few People
  let r1Score = 0
  if (total < 3) r1Score = 100
  else if (total === 3) r1Score = 70

  // Suppress all others if R1 >= 70
  if (r1Score >= 70) {
    return [buildRecommendation('R1', r1Score, friends)]
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

  const all = [
    { id: 'R1' as RuleId, score: r1Score },
    { id: 'R2' as RuleId, score: r2Score },
    { id: 'R3' as RuleId, score: r3Score },
    { id: 'R4' as RuleId, score: r4Score },
  ]

  const candidates = all
    .filter((r) => r.score >= 40)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return RULE_ORDER.indexOf(a.id) - RULE_ORDER.indexOf(b.id)
    })

  return candidates.map((r) => buildRecommendation(r.id, r.score, friends))
}