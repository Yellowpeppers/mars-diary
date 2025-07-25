import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return NextResponse.json({
    supabaseUrl: supabaseUrl || 'NOT_SET',
    supabaseAnonKeyExists: !!supabaseAnonKey,
    supabaseAnonKeyLength: supabaseAnonKey?.length || 0,
    timestamp: new Date().toISOString()
  })
}