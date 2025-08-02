'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Rocket, ArrowLeft, Loader2, Save, Image as ImageIcon } from 'lucide-react'
import { earthDateToSol, formatSolDate } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Navbar } from '@/components/navbar'
import { supabase } from '@/lib/supabase'
import { FullScreenLoading } from '@/components/ui/loading-spinner'
import { useToast, ToastContainer } from '@/components/ui/toast'
import { ProgressiveLoader } from '@/components/ui/progressive-loader'
import { DiaryGenerationSkeleton, ImageSkeleton } from '@/components/ui/skeleton-shimmer'

interface GeneratedContent {
  marsDiary: string
  marsEvent: string
  imageUrl?: string
  predictionId?: string
}

export default function WritePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { error: showError, success: showSuccess, toasts, removeToast } = useToast()
  const [earthDiary, setEarthDiary] = useState('')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <FullScreenLoading text="正在准备火星日记编辑器..." />
  }

  if (!isAuthenticated) {
    return null
  }

  const handleGenerate = async () => {
    if (earthDiary.length < 20) {
      setError('日记内容至少需要20个字符')
      return
    }

    setIsGenerating(true)
    setError('')
    setGeneratedContent(null)
    setIsSaved(false)

    try {
      // Generate Mars diary
      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ earthDiary }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '生成失败')
      }

      const data = await response.json()
      setGeneratedContent({
        marsDiary: data.marsDiary,
        marsEvent: data.marsEvent,
      })

      // Start image generation
      generateImage(data.marsDiary)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成火星日记时出现错误')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateImage = async (marsDiary: string) => {
    setIsGeneratingImage(true)
    
    try {
      // 获取当前用户的访问令牌
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('用户未登录')
      }

      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ marsDiary }),
      })

      if (!response.ok) {
        throw new Error('图像生成失败')
      }

      const data = await response.json()
      
      // 豆包API直接返回图片URL，无需轮询
      if (data.imageUrl) {
        setGeneratedContent(prev => prev ? {
          ...prev,
          imageUrl: data.imageUrl
        } : null)
      }
      
      setIsGeneratingImage(false)
    } catch (err) {
      console.error('图像生成错误:', err)
      setIsGeneratingImage(false)
    }
  }

  const handleSave = async () => {
    if (!generatedContent || !generatedContent.marsDiary) {
      setError('请先生成火星日记')
      return
    }

    setIsSaving(true)
    setError('')
    try {
      // 获取当前用户的访问令牌
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('用户未登录')
      }

      const response = await fetch('/api/diary/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          earthDiary,
          marsDiary: generatedContent.marsDiary,
          marsEvent: generatedContent.marsEvent,
          imageUrl: generatedContent.imageUrl
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '保存失败')
      }

      // 检查是否需要数据库设置
        if (data.needsSetup) {
          showError(
            '数据库设置需要',
            '数据库表尚未创建，请先在 Supabase 控制台执行 scripts/supabase-setup.sql 脚本来创建必要的数据库表。'
          )
          return
        }

        setIsSaved(true)
      // 可以选择重定向到时间线页面
      // router.push('/timeline')
    } catch (err) {
      console.error('保存日记错误:', err)
      setError(err instanceof Error ? err.message : '保存失败，请稍后重试')
    } finally {
      setIsSaving(false)
    }
  }

  const currentSol = earthDateToSol(new Date())

  return (
    <>
      {/* Full-screen background that covers everything including navbar area */}
      <div className="fixed inset-0 bg-fixed bg-center bg-cover z-0" style={{backgroundImage: 'url(/room.png)'}}>
        {/* Enhanced dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E12]/60 via-[#0B0E12]/40 to-[#0B0E12]/70 pointer-events-none" />
        {/* Subtle noise overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10" 
             style={{
               background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' fill='%23CED0D3'/%3E%3C/svg%3E")`,
               maskImage: 'radial-gradient(circle, white, transparent)'
             }} />
      </div>
      
      <div className="min-h-screen relative z-10">
        {/* Navigation */}
        <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 mt-16">
        <div className="grid lg:grid-cols-[18rem_1fr] gap-8">
          {/* Left Column - Sol Stats HUD */}
          <div className="space-y-6">
            {/* Sol Date Card */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 shadow-inner">
              <h3 className="text-xs font-semibold text-orange-200 tracking-widest uppercase mb-4" style={{fontFamily: 'Orbitron, sans-serif'}}>火星时间</h3>
              <div className="text-2xl font-bold text-white mb-2" style={{fontFamily: 'Orbitron, sans-serif'}}>
                {formatSolDate(currentSol)}
              </div>
              <div className="text-xs text-white/60 tracking-wide">
                地球时间: {new Date().toLocaleDateString('zh-CN')}
              </div>
            </div>
            
            {/* Environment Stats */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 shadow-inner">
              <h3 className="text-xs font-semibold text-orange-200 tracking-widest uppercase mb-4" style={{fontFamily: 'Orbitron, sans-serif'}}>环境数据</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">重力</span>
                  <span className="text-sm font-mono text-white">0.38g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">大气压</span>
                  <span className="text-sm font-mono text-white">0.6 kPa</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">温度</span>
                  <span className="text-sm font-mono text-white">-80°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60">Sol长度</span>
                  <span className="text-sm font-mono text-white">24h 39m</span>
                </div>
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 shadow-inner">
              <h3 className="text-xs font-semibold text-orange-200 tracking-widest uppercase mb-4" style={{fontFamily: 'Orbitron, sans-serif'}}>系统状态</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-white/80">通讯链路正常</span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Diary Input */}
          <div className="min-w-0">
            <div className="space-y-6">
              {/* Input Section */}
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 shadow-inner">
                <h2 className="text-lg font-semibold text-orange-200 tracking-wide mb-4" style={{fontFamily: 'Orbitron, sans-serif'}}>地球日志输入</h2>
                <textarea
                  value={earthDiary}
                  onChange={(e) => setEarthDiary(e.target.value)}
                  placeholder={`写下你今天的经历、感受或想法...

例如：今天和朋友一起去咖啡厅，聊了很久关于未来的计划。虽然外面下着雨，但心情很好。`}
                  className="w-full h-40 p-4 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-200/60 focus:bg-black/40 resize-none text-sm transition-all duration-200 custom-placeholder"
                  style={{fontFamily: 'monospace'}}
                />
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 space-y-3 sm:space-y-0">
                  <span className="text-white/60 text-xs font-mono">
                    {earthDiary.length}/20 字符（最少20字符）
                  </span>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || earthDiary.length < 20}
                    className="bg-orange-200/20 hover:bg-orange-200/30 disabled:bg-white/5 disabled:cursor-not-allowed text-white border border-orange-200/30 px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 text-sm backdrop-blur"
                    style={{fontFamily: 'Orbitron, sans-serif'}}
                  >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>生成中...</span>
                  </>
                ) : (
                  <span>转换为火星日记</span>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl backdrop-blur">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 shadow-inner">
              <ProgressiveLoader 
                isLoading={isGenerating} 
                stage={generatedContent ? 'complete' : 'generating'}
              />
            </div>
          )}

              {/* Generated Content */}
              {generatedContent && !isGenerating && (
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-3 sm:space-y-0">
                    <h2 className="text-lg font-semibold text-orange-200 tracking-wide" style={{fontFamily: 'Orbitron, sans-serif'}}>火星日志输出</h2>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || isGeneratingImage || isSaved}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 text-sm backdrop-blur border ${
                      isSaved 
                        ? 'bg-white/5 text-white/40 cursor-not-allowed border-white/10'
                        : (isSaving || isGeneratingImage)
                        ? 'bg-gray-600 text-white cursor-not-allowed border-gray-600'
                        : 'bg-orange-200/20 hover:bg-orange-200/30 text-white border-orange-200/30'
                    }`}
                    style={{fontFamily: 'Orbitron, sans-serif'}}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>保存中...</span>
                    </>
                  ) : isSaved ? (
                    <>
                      <Save className="h-4 w-4" />
                      <span>已保存</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>保存日记</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-orange-200 tracking-widest uppercase mb-3" style={{fontFamily: 'Orbitron, sans-serif'}}>火星日记</h3>
                  <div className="bg-black/30 p-4 rounded-lg border border-white/20">
                    <p className="text-white whitespace-pre-wrap text-sm leading-relaxed font-mono">
                      {generatedContent.marsDiary}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-orange-200 tracking-widest uppercase mb-3" style={{fontFamily: 'Orbitron, sans-serif'}}>火星事件</h3>
                  <div className="bg-black/30 p-4 rounded-lg border border-white/20">
                    <p className="text-white whitespace-pre-wrap text-sm leading-relaxed font-mono">
                      {generatedContent.marsEvent}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <div className="w-full aspect-video max-w-lg bg-black/50 border border-orange-200/30 rounded-lg flex items-center justify-center">
                    {isGeneratingImage ? (
                      <ImageSkeleton className="w-full h-full" />
                    ) : generatedContent.imageUrl ? (
                      <img
                        src={`/api/proxy-image?imageUrl=${encodeURIComponent(generatedContent.imageUrl)}`}
                        alt="火星场景"
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                      if (generatedContent.imageUrl) {
                        e.currentTarget.src = generatedContent.imageUrl
                      }
                    }}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-200 mx-auto mb-2" />
                        <p className="text-orange-200 text-xs sm:text-sm">火星场景插图</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
      </main>
      </div>
    </>
  )
}