import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert Earth date to Mars Sol
export function earthDateToSol(earthDate: Date): number {
  // Mars sol is approximately 24 hours 39 minutes 35 seconds
  // This is a simplified calculation
  const marsEpoch = new Date('2000-01-01T00:00:00Z')
  const earthDays = (earthDate.getTime() - marsEpoch.getTime()) / (1000 * 60 * 60 * 24)
  const marsSols = earthDays * 0.9747 // Earth day to Mars sol ratio
  return Math.floor(marsSols)
}

// Format Sol date for display
export function formatSolDate(sol: number): string {
  return `Sol ${sol.toLocaleString()}`
}

// Generate random Mars event for variety
export function getRandomMarsEvent(): string {
  const events = [
    '今日阿瑞斯圆顶城的人工重力系统进行了例行维护',
    '夜峡洞穴镇传来了新的地质发现消息',
    '极冠冰矿站的采集工作进展顺利',
    '同步轨道电梯今日运输了重要补给',
    '尘暴流浪车队在远方的地平线上若隐若现',
    '火星大气中的甲烷浓度出现了微妙变化',
    '太阳能电池板上积累的尘土被清理干净',
    '与地球的通讯窗口即将开启'
  ]
  return events[Math.floor(Math.random() * events.length)]
}