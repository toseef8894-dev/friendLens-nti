export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  role: 'hosting' | 'invited'
  date: string
  time: string | null
  created_at: string
  updated_at: string
}
