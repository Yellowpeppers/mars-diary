import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    // 从环境变量获取Supabase配置
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: '服务配置错误：缺少Supabase环境变量'
      }, { status: 500 })
    }
    
    // 从请求头获取认证令牌
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '缺少认证令牌' }, { status: 401 })
    }

    const token = authHeader.substring(7) // 移除 'Bearer ' 前缀
    
    // 创建带有用户令牌的 Supabase 客户端
    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    // 验证用户令牌
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: '无效的认证令牌' }, { status: 401 })
    }

    // 查询用户的日记
    const { data: diaries, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: '查询日记失败' }, { status: 500 })
    }

    return NextResponse.json({ diaries: diaries || [] })

  } catch (error) {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}