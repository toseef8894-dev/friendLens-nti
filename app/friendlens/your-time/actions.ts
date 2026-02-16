'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { TimeAllocation } from './types'

const PATH = '/friendlens/your-time'

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

// ── getTimeAllocations ──────────────────────────────────────

export async function getTimeAllocations(): Promise<{
  allocations?: TimeAllocation[]
  error?: string
}> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  const { data, error: dbError } = await supabase
    .from('time_allocations')
    .select('*')
    .eq('user_id', user.id)

  if (dbError) {
    console.error('getTimeAllocations error:', dbError)
    return { error: 'Failed to load time allocations' }
  }

  return { allocations: (data || []) as TimeAllocation[] }
}

// ── upsertTimeAllocations ───────────────────────────────────

interface TimeRow {
  category: string
  weekday: number
  weekend: number
  notes: string
}

export async function upsertTimeAllocations(rows: TimeRow[]) {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  // Validate each row
  for (const row of rows) {
    if (typeof row.weekday !== 'number' || row.weekday < 0) {
      return { error: `Invalid weekday value for ${row.category}.` }
    }
    if (typeof row.weekend !== 'number' || row.weekend < 0) {
      return { error: `Invalid weekend value for ${row.category}.` }
    }
    if (row.notes && row.notes.length > 30) {
      return { error: `Notes for ${row.category} exceed 30 characters.` }
    }
  }

  // Validate totals don't exceed 24
  const totalWeekday = rows.reduce((sum, r) => sum + r.weekday, 0)
  const totalWeekend = rows.reduce((sum, r) => sum + r.weekend, 0)

  if (totalWeekday > 24) {
    return { error: 'Adjust time to 24 hours or less allocated' }
  }
  if (totalWeekend > 24) {
    return { error: 'Adjust time to 24 hours or less allocated' }
  }

  const upsertRows = rows.map((r) => ({
    user_id: user.id,
    category: r.category,
    weekday: r.weekday,
    weekend: r.weekend,
    notes: r.notes || null,
  }))

  const { error: dbError } = await supabase
    .from('time_allocations')
    .upsert(upsertRows, { onConflict: 'user_id,category' })

  if (dbError) {
    console.error('upsertTimeAllocations error:', dbError)
    return { error: 'Failed to save time allocations: ' + dbError.message }
  }

  revalidatePath(PATH)
  return { success: true }
}
