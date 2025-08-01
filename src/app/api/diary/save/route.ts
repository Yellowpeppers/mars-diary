import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { earthDateToSol } from '@/lib/utils'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { earthDiary, marsDiary, marsEvent, imageUrl } = await request.json()

    // 验证必需字段
    if (!earthDiary || !marsDiary) {
      return NextResponse.json(
        { error: '地球日记和火星日记内容不能为空' },
        { status: 400 }
      )
    }

    // 从请求头获取认证令牌
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '缺少认证令牌' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // 移除 'Bearer ' 前缀
    
    // 创建服务角色客户端用于验证令牌
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // 验证用户令牌
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    console.log('认证结果:', { user: user?.id, authError })
    
    if (authError || !user) {
      console.error('认证失败:', authError)
      return NextResponse.json(
        { error: '用户未认证' },
        { status: 401 }
      )
    }

    const currentSol = earthDateToSol(new Date())
    const currentDate = new Date().toISOString()

    // 保存日记到数据库
    console.log('尝试插入数据:', {
      user_id: user.id,
      earth_diary: earthDiary?.substring(0, 50) + '...',
      mars_diary: marsDiary?.substring(0, 50) + '...',
      mars_event: marsEvent,
      image_url: imageUrl,
      sol_number: currentSol,
      created_at: currentDate
    })
    
    const { data, error } = await supabase
      .from('diary_entries')
      .insert({
        user_id: user.id,
        earth_diary: earthDiary,
        mars_diary: marsDiary,
        mars_event: marsEvent,
        image_url: imageUrl,
        sol_number: currentSol,
        created_at: currentDate
      })
      .select()
      .single()

    if (error) {
      console.error('保存日记错误:', error)
      
      // 如果表不存在，返回特殊提示
      if (error.message.includes('relation "diary_entries" does not exist')) {
        return NextResponse.json(
          { 
            error: '数据库表尚未创建，请先执行 scripts/supabase-setup.sql 脚本',
            success: false,
            needsSetup: true
          },
          { status: 200 }
        )
      }
      
      return NextResponse.json(
        { error: '保存日记失败，请稍后重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '日记保存成功！',
      diary: data
    })
  } catch (error) {
    console.error('保存日记时出错:', error)
    return NextResponse.json(
      { error: '保存日记时出现错误，请稍后重试' },
      { status: 500 }
    )
  }
}

// 获取用户的日记列表
export async function GET(request: NextRequest) {
  try {
    // 检查认证头
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '缺少认证令牌' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // 移除 'Bearer ' 前缀
    
    // 创建服务角色客户端用于验证令牌
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
     
    // 验证用户令牌
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('认证失败:', authError)
      return NextResponse.json(
        { error: '用户未认证' },
        { status: 401 }
      )
    }

    // 获取用户的日记列表
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取日记列表错误:', error)
      return NextResponse.json(
        { error: '获取日记列表失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      diaries: data
    })
  } catch (error) {
    console.error('获取日记列表时出错:', error)
    return NextResponse.json(
      { error: '获取日记列表时出现错误' },
      { status: 500 }
    )
  }
}