'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Rocket, ArrowLeft, Loader2, Save, Image as ImageIcon } from 'lucide-react'
import { earthDateToSol, formatSolDate } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Navbar } from '@/components/navbar'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-black flex items-center justify-center">
        <LoadingSpinner text="正在准备火星日记编辑器..." size="lg" />
      </div>
    )
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
        showSuccess(
          '保存成功',
          '火星日记已成功保存！'
        )
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
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-black">
      {/* Navigation */}
      <div className="bg-white/10 backdrop-blur-sm">
        <Navbar />
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Sol Date Display */}
      <div className="max-w-4xl mx-auto px-6 pt-4">
        <div className="text-center text-orange-200">
          {formatSolDate(currentSol)}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="space-y-6 md:space-y-8">
          {/* Input Section */}
          <div className="bg-black/30 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-orange-500/20">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">今天在地球上发生了什么？</h2>
            <textarea
              value={earthDiary}
              onChange={(e) => setEarthDiary(e.target.value)}
              placeholder="写下你今天的经历、感受或想法...\n\n例如：今天和朋友一起去咖啡厅，聊了很久关于未来的计划。虽然外面下着雨，但心情很好。"
              className="w-full h-32 sm:h-40 p-3 sm:p-4 bg-black/50 border border-orange-500/30 rounded-lg text-white placeholder-orange-300/60 focus:outline-none focus:border-orange-400 resize-none text-sm sm:text-base"
            />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 space-y-3 sm:space-y-0">
              <span className="text-orange-300 text-xs sm:text-sm">
                {earthDiary.length}/20 字符（最少20字符）
              </span>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || earthDiary.length < 20}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
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
            <div className="bg-red-900/50 border border-red-500/50 p-4 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="bg-black/30 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-orange-500/20">
              <ProgressiveLoader 
                isLoading={isGenerating} 
                stage={generatedContent ? 'complete' : 'generating'}
              />
            </div>
          )}

          {/* Generated Content */}
          {generatedContent && !isGenerating && (
            <div className="bg-black/30 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-orange-500/20">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-3 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white">你的火星日记</h2>
                <button
                  onClick={handleSave}
                  disabled={isSaving || isGeneratingImage || isSaved}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto ${
                    isSaved 
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : (isSaving || isGeneratingImage)
                      ? 'bg-gray-600 text-white cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="order-2 lg:order-1">
                  <div className="bg-orange-900/30 p-3 sm:p-4 rounded-lg mb-4">
                    <p className="text-orange-200 text-xs sm:text-sm mb-2">今日火星背景：</p>
                    <p className="text-orange-100 text-xs sm:text-sm">{generatedContent.marsEvent}</p>
                  </div>
                  
                  <div className="prose prose-invert max-w-none">
                    <div className="text-white whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                      {generatedContent.marsDiary}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center order-1 lg:order-2">
                  <div className="w-full aspect-square max-w-sm lg:max-w-none bg-black/50 border border-orange-500/30 rounded-lg flex items-center justify-center">
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
                        <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400 mx-auto mb-2" />
                        <p className="text-orange-200 text-xs sm:text-sm">火星场景插图</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}