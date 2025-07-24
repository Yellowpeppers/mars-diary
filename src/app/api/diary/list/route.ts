import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // 从请求头获取认证令牌
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '缺少认证令牌' }, { status: 401 })
    }

    const token = authHeader.substring(7) // 移除 'Bearer ' 前缀
    
    // 创建带有用户令牌的 Supabase 客户端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
      console.log('获取用户信息失败:', userError)
      return NextResponse.json({ error: '无效的认证令牌' }, { status: 401 })
    }

    console.log('获取日记列表 - 用户ID:', user.id)

    // 查询用户的日记
    const { data: diaries, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('查询日记失败:', error)
      return NextResponse.json({ error: '查询日记失败' }, { status: 500 })
    }

    console.log('查询到的日记数量:', diaries?.length || 0)
    return NextResponse.json({ diaries: diaries || [] })

  } catch (error) {
    console.error('获取日记列表错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}