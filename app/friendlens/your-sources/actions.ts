'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Source, SourceWithSignal, Signal } from './types'
import type { Friend } from '../your-people/types'

const PATH = '/friendlens/your-sources'

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

function computeSignal(reciprocalCount: number): Signal {
  if (reciprocalCount >= 2) return 'high'
  if (reciprocalCount === 1) return 'medium'
  return 'low'
}

// ── getSourcesWithSignal ──────────────────────────────────────

export async function getSourcesWithSignal(): Promise<{
  sources?: SourceWithSignal[]
  error?: string
}> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  // Fetch all sources for the user
  const { data: sources, error: srcError } = await supabase
    .from('sources')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (srcError) {
    console.error('getSourcesWithSignal error:', srcError)
    return { error: 'Failed to load sources' }
  }

  if (!sources || sources.length === 0) {
    return { sources: [] }
  }

  // Fetch all friend_sources for the user with joined friend data
  const { data: links, error: linkError } = await supabase
    .from('friend_sources')
    .select('source_id, friend_id, friends(did_they_invite_you, did_they_contact_you)')
    .eq('user_id', user.id)

  if (linkError) {
    console.error('getSourcesWithSignal links error:', linkError)
    return { error: 'Failed to load source links' }
  }

  // Build signal data per source
  const signalMap = new Map<string, { total: number; reciprocal: number }>()

  for (const link of links || []) {
    const entry = signalMap.get(link.source_id) || { total: 0, reciprocal: 0 }
    entry.total++

    const friend = link.friends as unknown as {
      did_they_invite_you: boolean | null
      did_they_contact_you: boolean | null
    } | null

    if (friend?.did_they_invite_you === true && friend?.did_they_contact_you === true) {
      entry.reciprocal++
    }

    signalMap.set(link.source_id, entry)
  }

  const result: SourceWithSignal[] = (sources as Source[]).map((s) => {
    const data = signalMap.get(s.id) || { total: 0, reciprocal: 0 }
    return {
      ...s,
      reciprocal_count: data.reciprocal,
      associated_people_count: data.total,
      signal: computeSignal(data.reciprocal),
    }
  })

  return { sources: result }
}

// ── createSource ──────────────────────────────────────────────

export async function createSource(name: string, sourceType?: string) {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  const trimmed = name.trim()
  if (!trimmed) {
    return { error: 'Source name cannot be empty.' }
  }
  if (trimmed.length > 100) {
    return { error: 'Source name is too long (max 100 characters).' }
  }

  const row: Record<string, unknown> = {
    user_id: user.id,
    name: trimmed,
  }
  if (sourceType) {
    row.source_type = sourceType
  }

  const { data, error: dbError } = await supabase
    .from('sources')
    .insert(row)
    .select()
    .single()

  if (dbError) {
    console.error('createSource error:', dbError)
    return { error: 'Failed to create source: ' + dbError.message }
  }

  revalidatePath(PATH)
  return { success: true, source: data as Source }
}

// ── updateSource ──────────────────────────────────────────────

type UpdatePayload = Pick<Source, 'name' | 'source_type' | 'active_members' | 'relevant_pct'>

export async function updateSource(sourceId: string, payload: Partial<UpdatePayload>) {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  if (!sourceId || typeof sourceId !== 'string') {
    return { error: 'Invalid source ID.' }
  }

  const update: Record<string, unknown> = {}

  if ('name' in payload) {
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    if (!name) return { error: 'Name cannot be empty.' }
    if (name.length > 100) return { error: 'Name is too long (max 100 characters).' }
    update.name = name
  }

  if ('source_type' in payload) {
    if (payload.source_type !== null && typeof payload.source_type !== 'string') {
      return { error: 'source_type must be a string or null.' }
    }
    update.source_type = payload.source_type
  }

  if ('active_members' in payload) {
    if (payload.active_members !== null && typeof payload.active_members !== 'number') {
      return { error: 'active_members must be a number or null.' }
    }
    update.active_members = payload.active_members
  }

  if ('relevant_pct' in payload) {
    if (payload.relevant_pct !== null && typeof payload.relevant_pct !== 'number') {
      return { error: 'relevant_pct must be a number or null.' }
    }
    update.relevant_pct = payload.relevant_pct
  }

  if (Object.keys(update).length === 0) {
    return { error: 'No fields to update.' }
  }

  const { error: dbError } = await supabase
    .from('sources')
    .update(update)
    .eq('id', sourceId)
    .eq('user_id', user.id)

  if (dbError) {
    console.error('updateSource error:', dbError)
    return { error: 'Failed to update source: ' + dbError.message }
  }

  revalidatePath(PATH)
  return { success: true }
}

// ── deleteSource ──────────────────────────────────────────────

export async function deleteSource(sourceId: string) {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  if (!sourceId || typeof sourceId !== 'string') {
    return { error: 'Invalid source ID.' }
  }

  const { error: dbError } = await supabase
    .from('sources')
    .delete()
    .eq('id', sourceId)
    .eq('user_id', user.id)

  if (dbError) {
    console.error('deleteSource error:', dbError)
    return { error: 'Failed to delete source: ' + dbError.message }
  }

  revalidatePath(PATH)
  return { success: true }
}

// ── linkFriendToSource ────────────────────────────────────────

export async function linkFriendToSource(friendId: string, sourceId: string) {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  const { error: dbError } = await supabase
    .from('friend_sources')
    .insert({ friend_id: friendId, source_id: sourceId, user_id: user.id })

  if (dbError) {
    if (dbError.code === '23505') {
      return { error: 'This person is already linked to this source.' }
    }
    console.error('linkFriendToSource error:', dbError)
    return { error: 'Failed to link person: ' + dbError.message }
  }

  revalidatePath(PATH)
  return { success: true }
}

// ── unlinkFriendFromSource ────────────────────────────────────

export async function unlinkFriendFromSource(friendId: string, sourceId: string) {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  const { error: dbError } = await supabase
    .from('friend_sources')
    .delete()
    .eq('friend_id', friendId)
    .eq('source_id', sourceId)
    .eq('user_id', user.id)

  if (dbError) {
    console.error('unlinkFriendFromSource error:', dbError)
    return { error: 'Failed to unlink person: ' + dbError.message }
  }

  revalidatePath(PATH)
  return { success: true }
}

// ── getFriendsForSource ───────────────────────────────────────

export async function getFriendsForSource(sourceId: string): Promise<{
  friendIds?: string[]
  error?: string
}> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  const { data, error: dbError } = await supabase
    .from('friend_sources')
    .select('friend_id')
    .eq('source_id', sourceId)
    .eq('user_id', user.id)

  if (dbError) {
    console.error('getFriendsForSource error:', dbError)
    return { error: 'Failed to load linked friends' }
  }

  return { friendIds: (data || []).map((d) => d.friend_id) }
}

// ── getAllFriends (for link modal) ────────────────────────────

export async function getAllFriends(): Promise<{
  friends?: Friend[]
  error?: string
}> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  const { data, error: dbError } = await supabase
    .from('friends')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (dbError) {
    console.error('getAllFriends error:', dbError)
    return { error: 'Failed to load friends' }
  }

  return { friends: (data || []) as Friend[] }
}
