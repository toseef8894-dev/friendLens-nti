'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Friend } from './types'

const PATH = '/friendlens/your-people'

type UpdatePayload = Pick<
  Friend,
  | 'relationship_type'
  | 'distance_miles'
  | 'visits_per_year'
  | 'contacts_per_year'
  | 'did_they_contact_you'
  | 'did_they_invite_you'
  | 'made_you_happier'
  | 'do_you_miss_them'
>

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

// ── createFriends ──────────────────────────────────────────────

export async function createFriends(names: string[]) {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  const trimmed = names.map((n) => n.trim()).filter((n) => n.length > 0)

  if (trimmed.length === 0) {
    return { error: 'Please enter at least one friend name.' }
  }

  if (trimmed.length > 50) {
    return { error: 'You can add up to 50 friends at a time.' }
  }

  for (const name of trimmed) {
    if (name.length > 100) {
      return { error: `Name "${name.slice(0, 20)}…" is too long (max 100 characters).` }
    }
  }

  const rows = trimmed.map((name) => ({ user_id: user.id, name }))

  const { error: dbError } = await supabase.from('friends').insert(rows)

  if (dbError) {
    console.error('createFriends error:', dbError)
    return { error: 'Failed to save friends: ' + dbError.message }
  }

  revalidatePath(PATH)
  return { success: true }
}

// ── addFriend ──────────────────────────────────────────────────

export async function addFriend(name: string) {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  const trimmed = name.trim()

  if (trimmed.length === 0) {
    return { error: 'Name cannot be empty.' }
  }

  if (trimmed.length > 100) {
    return { error: 'Name is too long (max 100 characters).' }
  }

  const { data, error: dbError } = await supabase
    .from('friends')
    .insert({ user_id: user.id, name: trimmed })
    .select()
    .single()

  if (dbError) {
    console.error('addFriend error:', dbError)
    return { error: 'Failed to add friend: ' + dbError.message }
  }

  revalidatePath(PATH)
  return { success: true, friend: data as Friend }
}

export async function updateFriend(
  friendId: string,
  payload: Partial<UpdatePayload>
) {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  if (!friendId || typeof friendId !== 'string') {
    return { error: 'Invalid friend ID.' }
  }

  // Build a sanitised update object — only allow known columns
  const allowed: (keyof UpdatePayload)[] = [
    'relationship_type',
    'distance_miles',
    'visits_per_year',
    'contacts_per_year',
    'did_they_contact_you',
    'did_they_invite_you',
    'made_you_happier',
    'do_you_miss_them',
  ]

  const update: Record<string, unknown> = {}

  for (const key of allowed) {
    if (key in payload) {
      const value = payload[key]

      // Type-check numbers
      if (
        ['distance_miles', 'visits_per_year', 'contacts_per_year'].includes(key)
      ) {
        if (value !== null && typeof value !== 'number') {
          return { error: `${key} must be a number or null.` }
        }
      }

      // Type-check booleans
      if (
        [
          'did_they_contact_you',
          'did_they_invite_you',
          'made_you_happier',
          'do_you_miss_them',
        ].includes(key)
      ) {
        if (value !== null && typeof value !== 'boolean') {
          return { error: `${key} must be true, false, or null.` }
        }
      }

      // Type-check strings
      if (key === 'relationship_type') {
        if (value !== null && typeof value !== 'string') {
          return { error: 'relationship_type must be a string or null.' }
        }
        if (typeof value === 'string' && value.length > 100) {
          return { error: 'relationship_type is too long (max 100 characters).' }
        }
      }

      update[key] = value
    }
  }

  if (Object.keys(update).length === 0) {
    return { error: 'No fields to update.' }
  }

  // RLS ensures user can only update their own rows.
  // We also explicitly scope to user_id as defense-in-depth.
  const { error: dbError } = await supabase
    .from('friends')
    .update(update)
    .eq('id', friendId)
    .eq('user_id', user.id)

  if (dbError) {
    console.error('updateFriend error:', dbError)
    return { error: 'Failed to update friend: ' + dbError.message }
  }

  revalidatePath(PATH)
  return { success: true }
}

// ── getFriend ───────────────────────────────────────────────────

export async function getFriend(friendId: string): Promise<{ friend?: Friend; error?: string }> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  if (!friendId || typeof friendId !== 'string') {
    return { error: 'Invalid friend ID.' }
  }

  const { data, error: dbError } = await supabase
    .from('friends')
    .select('*')
    .eq('id', friendId)
    .eq('user_id', user.id)
    .single()

  if (dbError) {
    console.error('getFriend error:', dbError)
    return { error: 'Friend not found' }
  }

  return { friend: data as Friend }
}

// ── deleteFriend ───────────────────────────────────────────────

export async function deleteFriend(friendId: string) {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  if (!friendId || typeof friendId !== 'string') {
    return { error: 'Invalid friend ID.' }
  }

  const { error: dbError } = await supabase
    .from('friends')
    .delete()
    .eq('id', friendId)
    .eq('user_id', user.id)

  if (dbError) {
    console.error('deleteFriend error:', dbError)
    return { error: 'Failed to delete friend: ' + dbError.message }
  }

  revalidatePath(PATH)
  return { success: true }
}
