'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { OnboardingPersonInput } from './_lib/onboardingInsight'

const PEOPLE_PATH = '/friendlens/your-people'

async function getAuthenticatedUser() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { supabase: null, user: null } as const
  }
  return { supabase, user } as const
}

function toRelationshipType(stage: OnboardingPersonInput['relationshipStage']): string {
  switch (stage) {
    case 'close_friend':
      return 'Close friend'
    case 'friend':
      return 'Friend'
    case 'new_friend':
      return 'New friend'
    case 'almost_friend':
      return 'Almost friend'
    case 'old_friend':
      return 'Old friend'
    case 'unclear':
      return 'Not sure'
  }
}

export async function getStartHereGateStatus(): Promise<{ shouldGate: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { shouldGate: false, error: 'Not authenticated' }
  }

  const { count, error } = await supabase
    .from('friends')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (error) {
    console.error('getStartHereGateStatus error:', error)
    return { shouldGate: false, error: 'Failed to check onboarding gate' }
  }

  return { shouldGate: !count || count === 0 }
}

export async function saveOnboardingFriend(input: OnboardingPersonInput): Promise<{ success?: true; error?: string }> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  const name = input.name.trim()
  if (!name) return { error: 'Name cannot be empty.' }
  if (name.length > 100) return { error: 'Name is too long (max 100 characters).' }

  const { error } = await supabase.from('friends').insert({
    user_id: user.id,
    name,
    relationship_type: toRelationshipType(input.relationshipStage),
    relationship_stage: input.relationshipStage,
    contact_frequency: input.contactFrequency,
    initiation_pattern: input.initiationPattern,
    after_contact_feeling: input.afterContactFeeling,
    desired_direction: input.desiredDirection,
    source: 'onboarding_add_1_friend',
    created_from_onboarding: true,
  })

  if (error) {
    console.error('saveOnboardingFriend error:', error)
    return { error: `Failed to save person: ${error.message}` }
  }

  // Invalidate Your People only (not start-here) so "Go to People" shows the new row without a full reload.
  revalidatePath(PEOPLE_PATH)
  return { success: true }
}
