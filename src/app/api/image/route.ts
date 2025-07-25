import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { marsDiary } = await request.json()

    if (!marsDiary) {
      return NextResponse.json(
        { error: '需要火星日记内容来生成图像' },
        { status: 400 }
      )
    }

    // 从火星日记中提取关键元素生成图像提示词
    const imagePrompt = `火星表面风景，红色星球地表，未来主义圆顶城市背景，火星殖民者日常生活，电影级光照，精细数字艺术，4K分辨率，科幻概念艺术`

    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ARK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'doubao-seedream-3-0-t2i-250415',
        prompt: imagePrompt,
        n: 1,
        size: '512x512'
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('豆包API错误:', errorData)
      throw new Error(`豆包API错误: ${response.status}`)
    }

    const result = await response.json()
    console.log('豆包API响应:', JSON.stringify(result, null, 2))

    // 检查响应格式并提取图片URL
    let imageUrl = null
    if (result.data && result.data.length > 0 && result.data[0].url) {
      imageUrl = result.data[0].url
    } else if (result.data && result.data.length > 0 && result.data[0].b64_json) {
      // 如果返回的是base64格式，转换为data URL
      imageUrl = `data:image/png;base64,${result.data[0].b64_json}`
    } else {
      console.error('无法从豆包API响应中提取图片URL:', result)
      throw new Error('豆包API响应格式异常')
    }

    return NextResponse.json({
      imageUrl: imageUrl,
      status: 'completed'
    })
  } catch (error) {
    console.error('生成图像时出错:', error)
    return NextResponse.json(
      { error: '生成图像时出现错误，请稍后重试' },
      { status: 500 }
    )
  }
}