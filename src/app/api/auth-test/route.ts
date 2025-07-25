import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        error: 'Supabase环境变量未配置',
        details: {
          supabaseUrl: !!supabaseUrl,
          supabaseAnonKey: !!supabaseAnonKey
        }
      }, { status: 500 })
    }

    // 创建Supabase客户端
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // 测试连接
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      return NextResponse.json({
        error: 'Supabase连接失败',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase认证配置正常',
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: '认证测试失败',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({
        error: '邮箱和密码不能为空'
      }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        error: 'Supabase环境变量未配置'
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // 测试登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      return NextResponse.json({
        error: '登录失败',
        details: error.message
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: '登录测试失败',
      details: error.message
    }, { status: 500 })
  }
}