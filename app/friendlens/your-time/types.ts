export interface TimeAllocation {
  id: string
  user_id: string
  category: string
  weekday: number
  weekend: number
  notes: string | null
  created_at: string
  updated_at: string
}
