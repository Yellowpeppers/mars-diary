import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { imageExists } from '@/lib/image-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('imageUrl')

    if (!imageUrl) {
      return NextResponse.json(
        { error: '缺少图片 URL' },
        { status: 400 }
      )
    }

    // 检查是否是本地图片路径
    if (imageUrl.startsWith('/uploads/images/')) {
      console.log('访问本地图片:', imageUrl)
      
      // 验证图片是否存在
      if (!imageExists(imageUrl)) {
        return NextResponse.json(
          { error: '图片不存在' },
          { status: 404 }
        )
      }
      
      try {
        const fullPath = path.join(process.cwd(), 'public', imageUrl)
        const imageBuffer = fs.readFileSync(fullPath)
        
        // 根据文件扩展名确定 Content-Type
        const ext = path.extname(imageUrl).toLowerCase()
        let contentType = 'image/jpeg'
        switch (ext) {
          case '.png':
            contentType = 'image/png'
            break
          case '.webp':
            contentType = 'image/webp'
            break
          case '.gif':
            contentType = 'image/gif'
            break
          default:
            contentType = 'image/jpeg'
        }
        
        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000',
            'Access-Control-Allow-Origin': '*',
          },
        })
      } catch (error) {
        console.error('读取本地图片失败:', error)
        return NextResponse.json(
          { error: '读取图片失败' },
          { status: 500 }
        )
      }
    }

    // 处理外部图片URL（原有逻辑）
    try {
      new URL(imageUrl)
    } catch {
      return NextResponse.json(
        { error: '无效的图片 URL' },
        { status: 400 }
      )
    }

    // 只允许 https 协议
    if (!imageUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: '只支持 HTTPS 图片链接' },
        { status: 400 }
      )
    }

    console.log('代理外部图片请求:', imageUrl)

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.8',
      },
    })

    if (!response.ok) {
      console.error('获取外部图片失败:', response.status, response.statusText)
      return NextResponse.json(
        { error: `获取图片失败: ${response.status}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type')
    const imageBuffer = await response.arrayBuffer()

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('代理图片错误:', error)
    return NextResponse.json(
      { error: '代理图片失败' },
      { status: 500 }
    )
  }
}