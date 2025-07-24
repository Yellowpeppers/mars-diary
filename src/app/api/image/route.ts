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

    // Extract key elements from mars diary for image prompt
    const imagePrompt = `A beautiful Mars landscape scene, red planet surface, futuristic dome city in background, Mars colonist daily life, cinematic lighting, detailed digital art, 4k resolution, science fiction concept art`

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'be04660a5b93ef2aff61e3668dedb4cbeb14941e62a3fd5998364a32d613e35e',
        input: {
          prompt: imagePrompt,
          width: 512,
          height: 512,
          num_outputs: 1,
          scheduler: 'K_EULER',
          num_inference_steps: 20,
          guidance_scale: 7.5,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`)
    }

    const prediction = await response.json()

    return NextResponse.json({
      predictionId: prediction.id,
      status: prediction.status,
    })
  } catch (error) {
    console.error('生成图像时出错:', error)
    return NextResponse.json(
      { error: '生成图像时出现错误，请稍后重试' },
      { status: 500 }
    )
  }
}

// Check image generation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const predictionId = searchParams.get('id')

    if (!predictionId) {
      return NextResponse.json(
        { error: '需要预测ID' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`)
    }

    const prediction = await response.json()

    return NextResponse.json({
      status: prediction.status,
      output: prediction.output,
      error: prediction.error,
    })
  } catch (error) {
    console.error('检查图像状态时出错:', error)
    return NextResponse.json(
      { error: '检查图像状态时出现错误' },
      { status: 500 }
    )
  }
}