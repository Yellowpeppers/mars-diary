import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { earthDateToSol } from '@/lib/utils'

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

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '用户未认证' },
        { status: 401 }
      )
    }

    const currentSol = earthDateToSol(new Date())
    const currentDate = new Date().toISOString()

    // 保存日记到数据库
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
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
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