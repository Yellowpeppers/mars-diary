import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const geminiApiKey = process.env.GEMINI_API_KEY
    const arkApiKey = process.env.ARK_API_KEY

    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? '已设置' : '未设置',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '已设置' : '未设置',
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? '已设置' : '未设置',
      GEMINI_API_KEY: geminiApiKey ? '已设置' : '未设置',
      ARK_API_KEY: arkApiKey ? '已设置' : '未设置'
    }

    return NextResponse.json({
      message: '环境变量检查',
      timestamp: new Date().toISOString(),
      runtime: 'edge',
      environmentVariables: envStatus,
      supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : null
    })
  } catch (error) {
    return NextResponse.json({
      error: '调试 API 失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}