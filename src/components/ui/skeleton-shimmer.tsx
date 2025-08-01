'use client'

import { cn } from '@/lib/utils'

interface SkeletonShimmerProps {
  className?: string
  children?: React.ReactNode
  variant?: 'card' | 'text' | 'image'
}

export function SkeletonShimmer({ 
  className = '', 
  children,
  variant = 'card'
}: SkeletonShimmerProps) {
  const baseClasses = {
    card: 'bg-black/30 backdrop-blur-sm border border-orange-500/20 rounded-lg',
    text: 'bg-orange-900/20 rounded',
    image: 'bg-black/50 border border-orange-500/30 rounded-lg'
  }

  return (
    <div className={cn(
      'relative overflow-hidden',
      baseClasses[variant],
      className
    )}>
      {/* 火星沙尘渐入效果 */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-orange-400/20 to-transparent" />
      
      {children}
    </div>
  )
}

// 文字骨架屏
export function TextSkeleton({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonShimmer
          key={i}
          variant="text"
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

// 卡片骨架屏
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <SkeletonShimmer variant="card" className={cn('p-4', className)}>
      <div className="flex items-center justify-between mb-2">
        <SkeletonShimmer variant="text" className="h-5 w-24" />
        <SkeletonShimmer variant="text" className="h-4 w-16" />
      </div>
      <TextSkeleton lines={2} className="mb-2" />
      <div className="flex items-center space-x-2">
        <SkeletonShimmer variant="text" className="h-4 w-4 rounded-full" />
        <SkeletonShimmer variant="text" className="h-3 w-12" />
      </div>
    </SkeletonShimmer>
  )
}

// 图片骨架屏
export function ImageSkeleton({ 
  className = '',
  aspectRatio = 'aspect-video'
}: { 
  className?: string
  aspectRatio?: string
}) {
  return (
    <SkeletonShimmer 
      variant="image" 
      className={cn(aspectRatio, 'flex items-center justify-center', className)}
    >
      <div className="text-center p-4">
        <div className="w-8 h-8 mx-auto mb-2 bg-orange-400/30 rounded-full animate-pulse" />
        <SkeletonShimmer variant="text" className="h-3 w-24 mx-auto" />
      </div>
    </SkeletonShimmer>
  )
}

// 火星日记生成骨架屏
export function DiaryGenerationSkeleton() {
  return (
    <div className="space-y-6">
      {/* 火星事件背景 */}
      <SkeletonShimmer variant="card" className="p-4">
        <SkeletonShimmer variant="text" className="h-4 w-32 mb-2" />
        <TextSkeleton lines={2} />
      </SkeletonShimmer>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 文字内容 */}
        <div className="order-2 lg:order-1">
          <TextSkeleton lines={8} />
        </div>
        
        {/* 图片区域 */}
        <div className="order-1 lg:order-2">
          <ImageSkeleton className="w-full max-w-sm lg:max-w-none mx-auto" />
        </div>
      </div>
    </div>
  )
}