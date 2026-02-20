'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CalendarEvent } from './types'

const PATH = '/friendlens/your-calendar'

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

// ── getCalendarEvents ──────────────────────────────────────

export async function getCalendarEvents(): Promise<{
  events?: CalendarEvent[]
  error?: string
}> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  const { data, error: dbError } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  if (dbError) {
    console.error('getCalendarEvents error:', dbError)
    return { error: 'Failed to load calendar events' }
  }

  return { events: (data || []) as CalendarEvent[] }
}

// ── createCalendarEvent ────────────────────────────────────

interface CreateEventData {
  title: string
  role: 'hosting' | 'invited'
  date: string
  time?: string | null
}

export async function createCalendarEvent(data: CreateEventData): Promise<{
  event?: CalendarEvent
  error?: string
}> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  if (!data.title || data.title.trim().length === 0) {
    return { error: 'Title is required' }
  }
  if (data.title.length > 100) {
    return { error: 'Title must be 100 characters or less' }
  }
  if (!data.date) {
    return { error: 'Date is required' }
  }
  if (!['hosting', 'invited'].includes(data.role)) {
    return { error: 'Role must be hosting or invited' }
  }

  const { data: created, error: dbError } = await supabase
    .from('calendar_events')
    .insert({
      user_id: user.id,
      title: data.title.trim(),
      role: data.role,
      date: data.date,
      time: data.time || null,
    })
    .select()
    .single()

  if (dbError) {
    console.error('createCalendarEvent error:', dbError)
    return { error: 'Failed to create event' }
  }

  revalidatePath(PATH)
  return { event: created as CalendarEvent }
}

// ── updateCalendarEvent ────────────────────────────────────

interface UpdateEventData {
  title?: string
  role?: 'hosting' | 'invited'
  date?: string
  time?: string | null
}

export async function updateCalendarEvent(
  id: string,
  data: UpdateEventData
): Promise<{ event?: CalendarEvent; error?: string }> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  if (data.title !== undefined) {
    if (data.title.trim().length === 0) {
      return { error: 'Title is required' }
    }
    if (data.title.length > 100) {
      return { error: 'Title must be 100 characters or less' }
    }
  }
  if (data.role !== undefined && !['hosting', 'invited'].includes(data.role)) {
    return { error: 'Role must be hosting or invited' }
  }

  const updateFields: Record<string, unknown> = {}
  if (data.title !== undefined) updateFields.title = data.title.trim()
  if (data.role !== undefined) updateFields.role = data.role
  if (data.date !== undefined) updateFields.date = data.date
  if (data.time !== undefined) updateFields.time = data.time || null

  const { data: updated, error: dbError } = await supabase
    .from('calendar_events')
    .update(updateFields)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (dbError) {
    console.error('updateCalendarEvent error:', dbError)
    return { error: 'Failed to update event' }
  }

  revalidatePath(PATH)
  return { event: updated as CalendarEvent }
}

// ── deleteCalendarEvent ────────────────────────────────────

export async function deleteCalendarEvent(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!supabase || !user) {
    return { error: 'Not authenticated' }
  }

  const { error: dbError } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (dbError) {
    console.error('deleteCalendarEvent error:', dbError)
    return { error: 'Failed to delete event' }
  }

  revalidatePath(PATH)
  return { success: true }
}
