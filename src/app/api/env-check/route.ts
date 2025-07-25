import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 检查所有环境变量
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      ARK_API_KEY: process.env.ARK_API_KEY
    }
    
    // 检查哪些变量已设置
    const status = Object.entries(envVars).map(([key, value]) => ({
      name: key,
      isSet: !!value,
      length: value ? value.length : 0,
      preview: value ? `${value.substring(0, 10)}...` : 'NOT_SET'
    }))
    
    const missingVars = status.filter(v => !v.isSet).map(v => v.name)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: 'Cloudflare Pages',
      variables: status,
      missing: missingVars,
      allSet: missingVars.length === 0,
      recommendations: missingVars.length > 0 ? [
        `缺少 ${missingVars.length} 个环境变量: ${missingVars.join(', ')}`,
        '请在 Cloudflare Pages 控制台的 Settings > Environment variables 中添加这些变量',
        '添加后需要重新部署项目'
      ] : [
        '所有环境变量已正确设置',
        '如果仍有问题，可能是 Supabase 配置或数据库表的问题'
      ]
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Environment check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}