import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// 安全性检查：确保API密钥存在
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required')
}

if (!process.env.ARK_API_KEY) {
  throw new Error('ARK_API_KEY environment variable is required')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { marsDiary } = await request.json()

    if (!marsDiary) {
      return NextResponse.json(
        { error: '需要火星日记内容来生成图像' },
        { status: 400 }
      )
    }

    // 第一步：使用Gemini提取场景描述
    const sceneExtractionPrompt = `You are an art director in a dystopian Mars universe.
From the diary below, pick EXACTLY one scene that
1) features the protagonist clearly (main character in action or close-up) AND
2) provides a strong environmental context.
Return the scene as one Chinese sentence, ≤ 30 characters, without extra words.
Diary:
"""
${marsDiary}
"""`

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const sceneResult = await model.generateContent(sceneExtractionPrompt)
    const sceneDescription = sceneResult.response.text().trim()
    
    console.log('提取的场景描述:', sceneDescription)

    // 第二步：将中文场景描述转换为英文并组装专业prompt
    const translatePrompt = `Translate this Chinese scene description to English, keeping it concise and vivid: "${sceneDescription}"`
    const translateResult = await model.generateContent(translatePrompt)
    const englishScene = translateResult.response.text().trim()
    
    console.log('英文场景描述:', englishScene)

    // 组装最终的图像生成prompt
    const imagePrompt = `${englishScene}, atmospheric wide shot, protagonist in foreground, dystopian & decayed sci-fi aesthetic, desaturated color palette, cracked surfaces, dust-filled air, chiaroscuro lighting, ultra-sharp 8K details, colors: pale orange (#E85C35), frost gray (#8A8F9A), deep black (#0B0E12), style of Moebius meets Simon Stålenhag, no text, no watermark, ruined habitat, melancholic mood`
    
    console.log('最终图像prompt:', imagePrompt)

    // 第三步：调用豆包API生成图像
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ARK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'doubao-seedream-3-0-t2i-250415',
        prompt: imagePrompt,
        negative_prompt: 'blurry, low-res, duplicate, extra limbs, text, logo, watermark, jpeg artifacts, cartoon, anime, bright colors, cheerful mood',
        n: 1,
        size: '1024x1024',
        quality: 'hd'
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
      status: 'completed',
      sceneDescription: sceneDescription,
      englishScene: englishScene,
      finalPrompt: imagePrompt
    })
  } catch (error) {
    console.error('生成图像时出错:', error)
    return NextResponse.json(
      { error: '生成图像时出现错误，请稍后重试' },
      { status: 500 }
    )
  }
}