export interface Friend {
  id: string
  user_id: string
  name: string
  relationship_type: string | null
  distance_miles: number | null
  visits_per_year: number | null
  contacts_per_year: number | null
  did_they_contact_you: boolean | null
  did_they_invite_you: boolean | null
  made_you_happier: boolean | null
  do_you_miss_them: boolean | null
  created_at: string
  updated_at: string
}
