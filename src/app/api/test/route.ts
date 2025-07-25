import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    // 测试基本功能，兼容 Edge Runtime
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const url = request.url
    
    return NextResponse.json({
      message: '测试 API 正常工作',
      userAgent,
      url,
      timestamp: new Date().toISOString(),
      runtime: 'edge',
      cloudflare: true
    })
  } catch (error) {
    return NextResponse.json({
      error: '测试 API 失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}