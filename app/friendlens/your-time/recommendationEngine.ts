import type { TimeAllocation } from './types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TimeCategory =
  | 'Work'
  | 'Commuting'
  | 'Shopping, Cooking'
  | 'Hobbies'
  | 'Exercise, Self-Maintenance'
  | 'Socializing w/ Friends'
  | 'Family Care, Spouse Time'
  | 'Television'
  | 'Social Media'
  | 'Gaming, Gambling'
  | 'Reading'
  | 'Sleeping'

export type StackGroup =
  | 'social_recovery'
  | 'energy_recovery'
  | 'time_reclaim'
  | 'stack_existing'

export type TimeRecoId =
  | 'tv_to_social'
  | 'social_media_to_social'
  | 'exercise_plus_social'
  | 'work_to_sleep'
  | 'sleep_recovery'
  | 'shopping_to_social'
  | 'commute_to_calls'
  | 'hobbies_to_social'

export interface TimeRecommendation {
  id: TimeRecoId
  priority: number
  title: string
  trade: string
  reason: string
  expectedImpact: string
  sourceCategory?: TimeCategory
  targetCategory?: TimeCategory
  stackGroup: StackGroup
  stackRank: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avgDaily(weekday: number, weekend: number): number {
  return (weekday + weekend) / 2
}

function getHours(allocations: TimeAllocation[], category: TimeCategory) {
  const found = allocations.find((a) => a.category === category)
  return { weekday: found?.weekday ?? 0, weekend: found?.weekend ?? 0 }
}

// ─── Stack Builder ────────────────────────────────────────────────────────────

export function buildStacks(recos: TimeRecommendation[]): TimeRecommendation[] {
  const groups = new Map<string, TimeRecommendation[]>()

  for (const r of recos) {
    if (!groups.has(r.stackGroup)) groups.set(r.stackGroup, [])
    groups.get(r.stackGroup)!.push(r)
  }

  const rankedStacks = Array.from(groups.entries())
    .map(([, items]) => {
      const sorted = [...items].sort((a, b) => b.priority - a.priority)
      const topTwo = sorted.slice(0, 2)
      return {
        items: sorted,
        topTwo,
        score: topTwo.reduce((sum, r) => sum + r.priority, 0),
      }
    })
    .sort((a, b) => b.score - a.score)

  if (rankedStacks.length > 0 && rankedStacks[0].topTwo.length === 2) {
    return rankedStacks[0].items
      .slice(0, 2)
      .sort((a, b) => (a.stackRank ?? 0) - (b.stackRank ?? 0))
  }

  // Fallback: top 1–2 by priority across all candidates
  return recos.sort((a, b) => b.priority - a.priority).slice(0, 2)
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function computeTimeRecommendations(
  allocations: TimeAllocation[]
): TimeRecommendation[] {
  const candidates: TimeRecommendation[] = []

  const tv = getHours(allocations, 'Television')
  const socialMedia = getHours(allocations, 'Social Media')
  const exercise = getHours(allocations, 'Exercise, Self-Maintenance')
  const work = getHours(allocations, 'Work')
  const sleep = getHours(allocations, 'Sleeping')
  const shopping = getHours(allocations, 'Shopping, Cooking')
  const commute = getHours(allocations, 'Commuting')
  const hobbies = getHours(allocations, 'Hobbies')
  const gaming = getHours(allocations, 'Gaming, Gambling')
  const reading = getHours(allocations, 'Reading')
  const socializing = getHours(allocations, 'Socializing w/ Friends')

  const avgTV = avgDaily(tv.weekday, tv.weekend)
  const avgSocialMedia = avgDaily(socialMedia.weekday, socialMedia.weekend)
  const avgExercise = avgDaily(exercise.weekday, exercise.weekend)
  const avgWork = avgDaily(work.weekday, work.weekend)
  const avgSleep = avgDaily(sleep.weekday, sleep.weekend)
  const avgShopping = avgDaily(shopping.weekday, shopping.weekend)
  const avgCommute = avgDaily(commute.weekday, commute.weekend)
  const avgSocializing = avgDaily(socializing.weekday, socializing.weekend)

  // Hobbies: dedicated category + Gaming + Reading combined
  const hobbiesWeekday = hobbies.weekday + gaming.weekday + reading.weekday
  const hobbiesWeekend = hobbies.weekend + gaming.weekend + reading.weekend
  const avgHobbies = avgDaily(hobbiesWeekday, hobbiesWeekend)
  const hobbiesIsUnderweight = avgHobbies < 0.5

  // ── SOCIAL RECOVERY ───────────────────────────────────────────────────────

  // tv_to_social
  if (avgTV > 1) {
    const priority = avgTV >= 2 ? 80 : 60
    candidates.push({
      id: 'tv_to_social',
      priority,
      title: 'Reclaim TV time',
      trade: 'Reclaim ~1 hour from TV and redirect it to a social touchpoint',
      reason: 'Passive time is displacing opportunities for connection',
      expectedImpact: 'Creates 1–2 high-probability social touchpoints this week',
      sourceCategory: 'Television',
      stackGroup: 'social_recovery',
      stackRank: 1,
    })
  }

  // social_media_to_social
  if (avgSocialMedia > 1) {
    const priority = avgSocialMedia >= 2 ? 75 : 55
    candidates.push({
      id: 'social_media_to_social',
      priority,
      title: 'Turn scrolling into connection',
      trade: 'Replace part of social media time with direct outreach to someone you know',
      reason: 'Consumption is replacing participation',
      expectedImpact: 'Converts passive input into active relational energy',
      sourceCategory: 'Social Media',
      stackGroup: 'social_recovery',
      stackRank: 2,
    })
  }

  // exercise_plus_social — dual group: social_recovery if socializing is low, else stack_existing
  if (avgExercise >= 0.5) {
    const isSocializingLow = avgSocializing < 1
    const stackGroup: StackGroup = isSocializingLow ? 'social_recovery' : 'stack_existing'
    const stackRank = isSocializingLow ? 3 : 2
    const priority = isSocializingLow ? 50 : 55
    candidates.push({
      id: 'exercise_plus_social',
      priority,
      title: 'Stack exercise with connection',
      trade: 'Pair an existing workout with a social component (walk, class, or invite)',
      reason: 'Exercise is already consistent and can carry social energy',
      expectedImpact: 'Adds connection without requiring new time blocks',
      sourceCategory: 'Exercise, Self-Maintenance',
      stackGroup,
      stackRank,
    })
  }

  // ── ENERGY RECOVERY ───────────────────────────────────────────────────────

  // work_to_sleep
  if (avgWork > 8 || avgSleep < 7) {
    const priority = avgWork > 9 || avgSleep < 6.5 ? 85 : 65
    candidates.push({
      id: 'work_to_sleep',
      priority,
      title: 'Reclaim work time for recovery',
      trade: 'Reduce late work and shift that time toward sleep',
      reason: 'Energy debt is reducing social capacity',
      expectedImpact: 'Improves baseline energy and availability for connection',
      sourceCategory: 'Work',
      targetCategory: 'Sleeping',
      stackGroup: 'energy_recovery',
      stackRank: 1,
    })
  }

  // sleep_recovery
  const sleepDelta = Math.abs(sleep.weekday - sleep.weekend)
  if (sleepDelta > 1.5 || avgSleep < 6.5) {
    const priority = sleepDelta > 2.5 || avgSleep < 6 ? 70 : 50
    candidates.push({
      id: 'sleep_recovery',
      priority,
      title: 'Stabilize sleep consistency',
      trade: 'Set a consistent sleep window and protect it',
      reason: 'Irregular sleep disrupts emotional and social regulation',
      expectedImpact: 'Increases reliability of energy across the week',
      sourceCategory: 'Sleeping',
      stackGroup: 'energy_recovery',
      stackRank: 2,
    })
  }

  // ── TIME RECLAIM ──────────────────────────────────────────────────────────

  // shopping_to_social
  if (avgShopping > 1) {
    const priority = avgShopping >= 2 ? 65 : 45
    candidates.push({
      id: 'shopping_to_social',
      priority,
      title: 'Consolidate errands',
      trade: 'Batch or reduce shopping time and redirect it toward social activity',
      reason: 'Fragmented errands consume usable social time',
      expectedImpact: 'Frees up time blocks for planned connection',
      sourceCategory: 'Shopping, Cooking',
      stackGroup: 'time_reclaim',
      stackRank: 1,
    })
  }

  // commute_to_calls
  if (avgCommute > 0.5) {
    const priority = avgCommute >= 1.5 ? 60 : 40
    candidates.push({
      id: 'commute_to_calls',
      priority,
      title: 'Turn commute into connection',
      trade: 'Use commute or transit time for voice calls with friends',
      reason: 'Commute time is underutilized relationally',
      expectedImpact: 'Converts dead time into meaningful interaction',
      sourceCategory: 'Commuting',
      stackGroup: 'time_reclaim',
      stackRank: 2,
    })
  }

  // ── STACK EXISTING ────────────────────────────────────────────────────────

  // hobbies_to_social — only when hobbies are not underweight
  if (!hobbiesIsUnderweight) {
    candidates.push({
      id: 'hobbies_to_social',
      priority: avgHobbies >= 2 ? 70 : 55,
      title: 'Activate hobbies socially',
      trade: 'Turn an existing hobby into a shared or group activity',
      reason: 'Hobbies are under-leveraged as connection sources',
      expectedImpact: 'Converts existing energy into relational growth',
      stackGroup: 'stack_existing',
      stackRank: 1,
    })
  }

  if (candidates.length === 0) return []

  return buildStacks(candidates)
}
