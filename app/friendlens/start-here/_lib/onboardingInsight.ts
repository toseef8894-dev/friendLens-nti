export type RelationshipStage =
  | 'close_friend'
  | 'friend'
  | 'new_friend'
  | 'almost_friend'
  | 'old_friend'
  | 'unclear'

export type ContactFrequency =
  | 'weekly_or_more'
  | 'monthly'
  | 'few_times_year'
  | 'rarely'
  | 'not_recently'

export type InitiationPattern =
  | 'mostly_me'
  | 'mostly_them'
  | 'balanced'
  | 'unclear'

export type AfterContactFeeling =
  | 'energized'
  | 'good'
  | 'mixed'
  | 'drained'
  | 'unclear'

export type DesiredDirection = 'more' | 'same' | 'less' | 'unsure'

export type InsightType =
  | 'high_potential'
  | 'easy_reactivation'
  | 'over_investing'
  | 'balanced_friendship'
  | 'low_energy_protect'
  | 'needs_clarity'

export interface OnboardingPersonInput {
  name: string
  relationshipStage: RelationshipStage
  contactFrequency: ContactFrequency
  initiationPattern: InitiationPattern
  afterContactFeeling: AfterContactFeeling
  desiredDirection: DesiredDirection
}

export interface OnboardingInsight {
  type: InsightType
  title: string
  message: string
  actionLabel: string
  actionSuggestion: string
  confidence: 'low' | 'medium' | 'high'
}

export const RELATIONSHIP_STAGE_OPTIONS: [RelationshipStage, string][] = [
  ['close_friend', 'Close friend'],
  ['friend', 'Friend'],
  ['new_friend', 'New friend'],
  ['almost_friend', 'Almost friend'],
  ['old_friend', 'Old friend'],
  ['unclear', 'Not sure'],
]

export const CONTACT_FREQUENCY_OPTIONS: [ContactFrequency, string][] = [
  ['weekly_or_more', 'Weekly or more'],
  ['monthly', 'Monthly'],
  ['few_times_year', 'A few times a year'],
  ['rarely', 'Rarely'],
  ['not_recently', 'Not recently'],
]

export const INITIATION_PATTERN_OPTIONS: [InitiationPattern, string][] = [
  ['mostly_me', 'Mostly me'],
  ['mostly_them', 'Mostly them'],
  ['balanced', 'Pretty balanced'],
  ['unclear', 'Not sure'],
]

export const AFTER_CONTACT_FEELING_OPTIONS: [AfterContactFeeling, string][] = [
  ['energized', 'Energized'],
  ['good', 'Good'],
  ['mixed', 'Mixed'],
  ['drained', 'Drained'],
  ['unclear', 'Not sure'],
]

export const DESIRED_DIRECTION_OPTIONS: [DesiredDirection, string][] = [
  ['more', 'More connection'],
  ['same', 'About the same'],
  ['less', 'Less connection'],
  ['unsure', 'Not sure'],
]

export function generateOnboardingInsight(person: OnboardingPersonInput): OnboardingInsight {
  const { name, relationshipStage, contactFrequency, initiationPattern, afterContactFeeling, desiredDirection } =
    person

  const feelsPositive = ['energized', 'good'].includes(afterContactFeeling)
  const feelsWeakOrNegative = ['mixed', 'drained'].includes(afterContactFeeling)
  const isLowFrequency = ['rarely', 'not_recently'].includes(contactFrequency)
  const isActiveFriendship = ['close_friend', 'friend', 'new_friend', 'almost_friend'].includes(relationshipStage)
  const isDormantFriendship = ['old_friend', 'friend'].includes(relationshipStage)
  const wantsMore = desiredDirection === 'more'
  const wantsMoreOrSame = ['more', 'same'].includes(desiredDirection)
  const wantsMoreOrUnsure = ['more', 'unsure'].includes(desiredDirection)
  const feelingAmbiguousOrPositive = ['energized', 'good', 'mixed', 'unclear'].includes(afterContactFeeling)

  if (wantsMore && feelsPositive && isActiveFriendship) {
    return {
      type: 'high_potential',
      title: `${name} has live potential.`,
      message: `You've already enjoyed time with ${name}. A move this week will build on that.`,
      actionLabel: 'Next step',
      actionSuggestion: `Send ${name} a quick invite this week - coffee or a walk.`,
      confidence: 'high',
    }
  }

  if (isDormantFriendship && isLowFrequency && feelingAmbiguousOrPositive && wantsMoreOrUnsure) {
    return {
      type: 'easy_reactivation',
      title: `${name} may be easier to restart than you think.`,
      message:
        'There is already history here. You probably do not need a big reset - just a low-pressure re-entry.',
      actionLabel: 'Next step',
      actionSuggestion: `Send ${name} a simple check-in. A short message referencing something you both remember is enough.`,
      confidence: 'high',
    }
  }

  if (initiationPattern === 'mostly_me' && wantsMoreOrSame && feelsWeakOrNegative) {
    return {
      type: 'over_investing',
      title: `You may be carrying more of this friendship than ${name} is.`,
      message: "You've been the one showing up. That's worth noticing before you do it again.",
      actionLabel: 'Next step',
      actionSuggestion: `Don't reach out this week. See if ${name} initiates anything.`,
      confidence: 'high',
    }
  }

  if (initiationPattern === 'balanced' && feelsPositive && wantsMoreOrSame) {
    return {
      type: 'balanced_friendship',
      title: `${name} looks worth maintaining.`,
      message:
        'There is positive energy and some reciprocity here. The move is not to analyze it harder. Keep it warm.',
      actionLabel: 'Next step',
      actionSuggestion: `Pick one easy next thing with ${name} in the next few weeks.`,
      confidence: 'high',
    }
  }

  if (afterContactFeeling === 'drained' && ['less', 'unsure'].includes(desiredDirection)) {
    return {
      type: 'low_energy_protect',
      title: `${name} may need less access to your time.`,
      message: "This one costs you. That's a signal worth acting on, not explaining away.",
      actionLabel: 'Next step',
      actionSuggestion: `Say no to the next ask from ${name}. See how it feels.`,
      confidence: 'medium',
    }
  }

  return {
    type: 'needs_clarity',
    title: `${name} needs one more signal.`,
    message:
      'There is not enough pattern yet to make a strong call. The cleanest move is a small interaction and then notice how it feels.',
    actionLabel: 'Next step',
    actionSuggestion: `Have one simple interaction with ${name}, then notice whether you feel more open, neutral, or depleted afterward.`,
    confidence: 'low',
  }
}
