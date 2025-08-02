'use client'

import { useState, useEffect } from 'react'
import { Loader2, Radio, Satellite, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressiveLoaderProps {
  isLoading: boolean
  stage: 'connecting' | 'generating' | 'complete'
  className?: string
}

const loadingStages = [
  {
    id: 'connecting',
    icon: Radio,
    messages: [
      '正在同步火星频道...',
      '正在解析地球信号...',
      '建立跨星际通讯...'
    ],
    duration: 2000
  },
  {
    id: 'generating', 
    icon: Satellite,
    messages: [
      '火星AI正在思考...',
      '转换地球记忆...',
      '注入火星元素...',
      '优化叙事结构...'
    ],
    duration: 1500
  },
  {
    id: 'finalizing',
    icon: Zap,
    messages: [
      '最后润色中...',
      '即将完成...'
    ],
    duration: 1000
  }
]

export function ProgressiveLoader({ 
  isLoading, 
  stage, 
  className = '' 
}: ProgressiveLoaderProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setCurrentMessageIndex(0)
      setCurrentStageIndex(0)
      setProgress(0)
      return
    }

    const currentStage = loadingStages[currentStageIndex]
    if (!currentStage) return

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => {
        const nextIndex = prev + 1
        if (nextIndex >= currentStage.messages.length) {
          // 移动到下一个阶段
          if (currentStageIndex < loadingStages.length - 1) {
            setCurrentStageIndex(currentStageIndex + 1)
            return 0
          }
          return prev // 保持在最后一条消息
        }
        return nextIndex
      })
    }, currentStage.duration)

    // 进度条动画
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const increment = 100 / (loadingStages.length * 4)
        return Math.min(prev + increment, 95) // 最多到95%，完成时到100%
      })
    }, 200)

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
    }
  }, [isLoading, currentStageIndex])

  useEffect(() => {
    if (stage === 'complete') {
      setProgress(100)
    }
  }, [stage])

  if (!isLoading) return null

  const currentStage = loadingStages[currentStageIndex] || loadingStages[0]
  const CurrentIcon = currentStage.icon
  const currentMessage = currentStage.messages[currentMessageIndex] || currentStage.messages[0]

  return (
    <div className={cn('text-center py-8', className)}>
      {/* 主要加载图标 */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-orange-200/30 animate-pulse" />
        <CurrentIcon className="w-8 h-8 mx-auto text-orange-400 animate-pulse" />
        <Loader2 className="w-6 h-6 absolute top-1 left-1/2 transform -translate-x-1/2 animate-spin text-orange-300" />
      </div>

      {/* 进度条 */}
      <div className="w-full max-w-xs mx-auto mb-4">
        <div className="h-1 bg-orange-900/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-orange-200 mt-1">
          {Math.round(progress)}%
        </div>
      </div>

      {/* 当前消息 */}
      <p className="text-sm text-orange-200 font-medium mb-4 animate-pulse">
        {currentMessage}
      </p>

      {/* 阶段指示器 */}
      <div className="flex justify-center space-x-2">
        {loadingStages.map((stage, index) => {
          const StageIcon = stage.icon
          return (
            <div
              key={stage.id}
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300',
                index <= currentStageIndex
                  ? 'bg-[#E85C35] text-white'
                  : 'bg-[#BF4A2A]/30 text-[#BF4A2A]/50'
              )}
            >
              <StageIcon className="w-3 h-3" />
            </div>
          )
        })}
      </div>

      {/* 火星主题装饰点 */}
      <div className="flex justify-center space-x-1 mt-4">
        <div className="w-1 h-1 bg-[#BF4A2A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-1 bg-[#BF4A2A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1 h-1 bg-[#BF4A2A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

// 简化版本，用于快速加载场景
export function QuickLoader({ 
  message = '正在加载...', 
  className = '' 
}: { 
  message?: string
  className?: string 
}) {
  return (
    <div className={cn('flex items-center justify-center space-x-3', className)}>
      <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
      <span className="text-sm text-orange-200 animate-pulse">{message}</span>
    </div>
  )
}