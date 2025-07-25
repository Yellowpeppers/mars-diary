'use client'

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ 
  text = '正在加载...', 
  size = 'md',
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative">
        {/* 外圈火星轨道效果 */}
        <div className="absolute inset-0 rounded-full border-2 border-orange-200/30 animate-pulse" />
        {/* 旋转的加载图标 */}
        <Loader2 className={`${sizeClasses[size]} animate-spin text-orange-400`} />
      </div>
      
      {text && (
        <p className="text-sm text-orange-200/80 font-medium animate-pulse">
          {text}
        </p>
      )}
      
      {/* 火星主题装饰点 */}
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

// 全屏加载组件
export function FullScreenLoading({ text = '正在连接火星基地...' }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-black flex items-center justify-center">
      <div className="text-center p-8">
        <LoadingSpinner text={text} size="lg" />
        
        {/* 火星背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-300/20 rounded-full animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-red-300/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-orange-400/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>
    </div>
  )
}