import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { earthDateToSol } from '@/lib/utils'

export const runtime = 'nodejs'

// 检查环境变量
const geminiApiKey = process.env.GEMINI_API_KEY || 'AIzaSyCTVs2Tdxmtyhl1hQmwSIwl2itYmFAv5Ws'
if (!geminiApiKey) {
  console.error('GEMINI_API_KEY 环境变量未设置')
  throw new Error('GEMINI_API_KEY 环境变量未设置')
}

console.log('使用Gemini API Key:', geminiApiKey ? '已设置' : '未设置')
const genAI = new GoogleGenerativeAI(geminiApiKey)

// 随机环境事件列表
const MARS_EVENTS = [
  '沙尘暴 Level‑2',
  '太阳风辐射警报',
  '真空管列车故障',
  '货舱坠落警报',
  '极夜心理测试'
]

function getRandomMarsEvents(): string[] {
  const eventCount = Math.floor(Math.random() * 3) // 0-2个事件
  const shuffled = [...MARS_EVENTS].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, eventCount)
}

function createMarsPrompt(earthDiary: string, solNumber: number, events: string[]): string {
  const eventsText = events.length > 0 ? `\n今日环境事件：${events.join('、')}` : ''
  
  return `你是一位生活在火星上的「我」（第一人称，中文）。请根据以下设定与输入，撰写一篇250字左右的《火星日记》，并用信件形式结尾署名"— Sol‑${solNumber} 的你"。

基础世界观
重力 0.38 g；外出需轻质软壳宇航服
粉橘天空、稀薄 CO₂ 大气
时间：1 sol ≈ 24 h 39 m
主要场景：阿瑞斯圆顶城、夜峡洞穴镇、极冠冰矿站、同步轨道电梯、尘暴流浪车队
社会经济：企业‑城邦制；货币 OxyCredit；身份等级会随历程提升${eventsText}

写作要求
参考用户输入，进行「地球元素 → 火星对应」映射，例如：通勤 → MagLine 排队、下雨 → 尘暴预警、买咖啡 → 合成胺基咖啡。
保留用户原文的情绪基调，并结合火星环境放大或调和。
文体：亲笔信 / 日志；适度加入细节描写（如低重力行走、氧气配额）。
使用冷淡、硬科幻、略带魔幻感的语言；避免口水化叙述。
结尾用一两句富含希望或反思的评论，并署名。

用户输入：
${earthDiary}`
}

export async function POST(request: NextRequest) {
  try {
    // 安全性检查：验证请求方法和内容类型
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: '仅支持POST请求' },
        { status: 405 }
      )
    }

    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: '请求必须是JSON格式' },
        { status: 400 }
      )
    }

    const { earthDiary } = await request.json()

    // 输入验证和清理
    if (!earthDiary || typeof earthDiary !== 'string') {
      return NextResponse.json(
        { error: '日记内容必须是有效的字符串' },
        { status: 400 }
      )
    }

    const cleanedDiary = earthDiary.trim()
    if (cleanedDiary.length < 20) {
      return NextResponse.json(
        { error: '日记内容至少需要20个字符' },
        { status: 400 }
      )
    }

    if (cleanedDiary.length > 2000) {
      return NextResponse.json(
        { error: '日记内容不能超过2000个字符' },
        { status: 400 }
      )
    }

    const currentSol = earthDateToSol(new Date())
    const marsEvents = getRandomMarsEvents()
    const prompt = createMarsPrompt(cleanedDiary, currentSol, marsEvents)

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const marsDiary = response.text()

    if (!marsDiary) {
      throw new Error('生成火星日记失败')
    }

    return NextResponse.json({
      marsDiary,
      marsEvent: marsEvents.join('、') || '今日火星平静如常',
      solNumber: currentSol
    })
  } catch (error) {
    console.error('生成火星日记时出错:', error)
    return NextResponse.json(
      { error: '生成火星日记时出现错误，请稍后重试' },
      { status: 500 }
    )
  }
}