export interface Source {
  id: string
  user_id: string
  name: string
  source_type: string | null
  active_members: number | null
  relevant_pct: number | null
  created_at: string
  updated_at: string
}

export const SOURCE_TYPES = [
  'Activity',
  'Club',
  'Work',
  'Spiritual',
  'Cultural',
  'Other',
] as const

export type SourceType = (typeof SOURCE_TYPES)[number]

export type Signal = 'high' | 'medium' | 'low'

export interface SourceWithSignal extends Source {
  reciprocal_count: number
  associated_people_count: number
  signal: Signal
}
