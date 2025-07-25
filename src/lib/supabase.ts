import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface DiaryEntry {
  id: string
  user_id: string
  earth_diary: string
  mars_diary: string
  mars_event?: string
  image_url?: string
  sol_number?: number
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  created_at: string
  updated_at: string
}