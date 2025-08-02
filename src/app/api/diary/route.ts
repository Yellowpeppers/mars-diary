import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { earthDateToSol } from '@/lib/utils'

export const runtime = 'nodejs'

// 检查环境变量
const geminiApiKey = process.env.GEMINI_API_KEY
if (!geminiApiKey) {
  console.error('GEMINI_API_KEY 环境变量未设置')
  throw new Error('GEMINI_API_KEY 环境变量未设置')
}

console.log('使用Gemini API Key:', geminiApiKey ? '已设置' : '未设置')
const genAI = new GoogleGenerativeAI(geminiApiKey)

// 随机环境事件列表（基于三大支柱设计）
const MARS_EVENTS = [
  '全球尘暴预警Level-3（低压红尘）',
  '0.38G跳跃球联赛开幕（半重力乐园）',
  'Hydro-Credit汇率波动+15%（资源即货币）',
  '真空管列车系统维护',
  'Hab-Dome气压异常检测',
  '极地冰矿站产量下降',
  '太阳风辐射屏蔽升级',
  'Regolith土壤脱毒实验成功'
]

function getRandomMarsEvents(): string[] {
  const eventCount = Math.floor(Math.random() * 3) // 0-2个事件
  const shuffled = [...MARS_EVENTS].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, eventCount)
}

function createMarsPrompt(earthDiary: string, solNumber: number, events: string[]): string {
  const eventsText = events.length > 0 ? `\n今日环境事件：${events.join('、')}` : ''
  
  return `你是一位生活在火星上的「我」（第一人称，中文）。请根据以下世界观设定与映射规则，撰写一篇250字左右的《火星日记》，并用信件形式结尾署名"— Sol‑${solNumber} 的你"。

世界观三大支柱（所有内容都应扣在这三件事上）：
A. 低压红尘（环境差异）：0.6% 地表气压、95% CO₂ 气氛、24h 39m 的Sol、尘暴可遮天数周
B. 半重力乐园（身体差异）：表面重力 0.38g，跳跃高度≈地球2.6×，运动方式/建筑尺度全被改写
C. 资源即货币（经济差异）：水冰、光照、封装空气、辐射屏蔽材质＝硬通货；每件事都围着"存活&制氧"打转${eventsText}

核心映射词典（地球元素 → 火星镜像）：
住宅：公寓 → Hab-Dome单元（透光ETFE膜+冰水墙阻辐射）
交通：汽车 → Rover Pod（6轮履带）、地铁 → 真空管列车（600km/h）
天气：下雨 → 二氧化碳雪（碳霜）、台风 → 全球尘暴（每6-8年一次）
动物：猫 → 低重力沙丘虎（长四肢、膜状尾巴）
植物：盆栽 → Hydro-Bamboo（光照强、CO₂高→超速光合）
工作：农民 → Regolith土壤学家、程序员 → 轨道网格工程师、咖啡师 → 气闸咖啡管理员
娱乐：足球 → 0.38G跳跃球（球门竖三层）、音乐会 → 峡谷回声秀
经济：美元 → Hydro-Credit（1HC=1L纯水）

写作要求：
1. 严格按照映射词典进行"地球元素 → 火星对应"转换
2. 每段必须体现A/B/C三大支柱中至少一个环境细节
3. 保留用户原文的情绪基调，结合火星环境放大或调和
4. 文体：亲笔信/日志；使用冷淡、硬科幻、略带魔幻感的语言
5. 结尾用一两句富含希望或反思的评论，并署名

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