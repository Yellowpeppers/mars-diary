import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // 从环境变量获取Supabase配置
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
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
    
    // 创建服务角色客户端用于验证令牌
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // 验证用户令牌
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      console.error('令牌验证失败:', userError?.message)
      return NextResponse.json({ error: '无效的认证令牌' }, { status: 401 })
    }

    // 查询用户的日记，只选择必要字段以提高性能
    const { data: diaries, error } = await supabaseAdmin
      .from('diary_entries')
      .select('id, earth_diary, mars_diary, mars_event, image_url, sol_number, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100) // 限制返回数量，提高性能

    if (error) {
      console.error('查询日记失败:', error.message)
      return NextResponse.json({ error: '查询日记失败' }, { status: 500 })
    }

    const response = NextResponse.json({ diaries: diaries || [] })
    
    // 添加缓存头以提高性能
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=300')
    
    return response

  } catch (error) {
    console.error('服务器内部错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}