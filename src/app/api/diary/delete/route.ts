import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { deleteLocalImage, deleteImageFromSupabase } from '@/lib/image-storage'

export const runtime = 'nodejs'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const diaryId = searchParams.get('id')

    if (!diaryId) {
      return NextResponse.json(
        { error: '缺少日记ID参数' },
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
    
    if (authError || !user) {
      console.error('认证失败:', authError)
      return NextResponse.json(
        { error: '用户未认证' },
        { status: 401 }
      )
    }

    // 首先获取日记信息，检查权限并获取图片URL
    const { data: diary, error: fetchError } = await supabase
      .from('diary_entries')
      .select('id, user_id, image_url')
      .eq('id', diaryId)
      .eq('user_id', user.id) // 确保只能删除自己的日记
      .single()

    if (fetchError || !diary) {
      console.error('获取日记失败:', fetchError)
      return NextResponse.json(
        { error: '日记不存在或无权限删除' },
        { status: 404 }
      )
    }

    // 删除数据库中的日记记录
    const { error: deleteError } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', diaryId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('删除日记失败:', deleteError)
      return NextResponse.json(
        { error: '删除日记失败，请稍后重试' },
        { status: 500 }
      )
    }

    // 删除关联的图片文件
    if (diary.image_url) {
      try {
        // 判断是 Supabase Storage 图片还是本地图片
        if (diary.image_url.includes('supabase')) {
          // 删除 Supabase Storage 中的图片
          await deleteImageFromSupabase(diary.image_url, user.id)
          console.log('Supabase 图片已删除:', diary.image_url)
        } else if (diary.image_url.startsWith('/uploads/images/')) {
          // 删除本地图片
          await deleteLocalImage(diary.image_url)
          console.log('本地图片已删除:', diary.image_url)
        }
      } catch (imageError) {
        console.warn('删除图片失败:', imageError)
        // 图片删除失败不影响日记删除的成功
      }
    }

    return NextResponse.json({
      success: true,
      message: '日记删除成功！'
    })
  } catch (error) {
    console.error('删除日记时出错:', error)
    return NextResponse.json(
      { error: '删除日记时出现错误，请稍后重试' },
      { status: 500 }
    )
  }
}