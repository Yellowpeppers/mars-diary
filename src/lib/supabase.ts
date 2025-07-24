import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface DiaryEntry {
  id: string
  user_id: string
  earth_diary: string
  mars_diary: string
  image_url?: string
  sol_date: number
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  created_at: string
  updated_at: string
}