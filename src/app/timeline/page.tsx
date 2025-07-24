'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Rocket, ArrowLeft, Calendar, Image as ImageIcon, Share2, Loader2 } from 'lucide-react'
import { formatSolDate } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Navbar } from '@/components/navbar'
import { supabase } from '@/lib/supabase'
import { DiaryEntry } from '@/lib/supabase'

// Mock data for demonstration
const mockDiaries = [
  {
    id: '1',
    sol_date: 12847,
    earth_diary: '今天和朋友一起去咖啡厅，聊了很久关于未来的计划。虽然外面下着雨，但心情很好。',
    mars_diary: '今天Sol 12847，阿瑞斯圆顶城内的咖啡合成器又升级了。我和同伴在观景台上品尝着从地球记忆中重构的咖啡味道，透过透明的圆顶看着外面橙红色的天空中飘洒着细小的尘粒——这里的"雨"。在0.38g的重力下，我们的对话显得格外轻松，每个手势都带着一种优雅的缓慢。我们讨论着下一次探索任务的计划，心中充满了对这片红色大地无限可能的憧憬。',
    mars_event: '今日阿瑞斯圆顶城的人工重力系统进行了例行维护',
    image_url: null,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    sol_date: 12846,
    earth_diary: '工作很忙，但是完成了一个重要项目，感觉很有成就感。',
    mars_diary: 'Sol 12846，在夜峡洞穴镇的地下实验室里，我终于完成了火星土壤改良项目的关键阶段。在这个由天然熔岩管改造的工作空间里，微弱的人工光源照亮着我的工作台。经过数个Sol的努力，土壤样本终于显示出了可以支持地球植物生长的化学指标。在这个重力只有地球三分之一的世界里，每一份成就都显得格外珍贵。我知道这一小步，将为整个火星殖民地的食物自给自足迈出重要一步。',
    mars_event: '夜峡洞穴镇传来了新的地质发现消息',
    image_url: null,
    created_at: '2024-01-14T14:20:00Z'
  }
]

export default function TimelinePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [diaries, setDiaries] = useState<DiaryEntry[]>([])
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null)
  const [isLoadingDiaries, setIsLoadingDiaries] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isAuthenticated, isLoading, router])

  // 获取用户的日记数据
  useEffect(() => {
    const fetchDiaries = async () => {
      if (!isAuthenticated) return
      
      try {
        setIsLoadingDiaries(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          console.error('用户未登录')
          return
        }

        const response = await fetch('/api/diary/list', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setDiaries(data.diaries || [])
        } else {
          console.error('获取日记失败:', response.statusText)
        }
      } catch (error) {
        console.error('获取日记时出错:', error)
      } finally {
        setIsLoadingDiaries(false)
      }
    }

    if (isAuthenticated) {
      fetchDiaries()
    }
  }, [isAuthenticated])

  if (isLoading || isLoadingDiaries) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-black">
        <div className="bg-white/10 backdrop-blur-sm">
          <Navbar />
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400 mx-auto mb-4" />
            <p className="text-orange-200">正在加载火星日记...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const handleShare = (diary: DiaryEntry) => {
    const solDate = diary.sol_number || 0
    if (navigator.share) {
      navigator.share({
        title: `火星日记 - ${formatSolDate(solDate)}`,
        text: diary.mars_diary.substring(0, 100) + '...',
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `火星日记 - ${formatSolDate(solDate)}\n\n${diary.mars_diary}\n\n来自火星日记模拟器`
      )
      alert('日记内容已复制到剪贴板！')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-black">
      {/* Navigation */}
      <div className="bg-white/10 backdrop-blur-sm">
        <Navbar />
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {diaries.length === 0 ? (
          // Empty state
          <div className="text-center py-20">
            <Calendar className="h-16 w-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">还没有火星日记</h2>
            <p className="text-orange-200 mb-6">开始记录你在红色星球上的第一天吧！</p>
            <Link href="/write" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              写第一篇日记
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Timeline List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">日记时间线</h2>
              {diaries.map((diary) => (
                <div
                  key={diary.id}
                  onClick={() => setSelectedDiary(diary)}
                  className={`bg-black/30 backdrop-blur-sm p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedDiary?.id === diary.id
                      ? 'border-orange-400 bg-orange-900/20'
                      : 'border-orange-500/20 hover:border-orange-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-orange-400 font-semibold">
                      {formatSolDate(diary.sol_number || 0)}
                    </span>
                    <span className="text-orange-300 text-sm">
                      {new Date(diary.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-white text-sm line-clamp-2">
                    {diary.earth_diary}
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    {diary.image_url && (
                      <ImageIcon className="h-4 w-4 text-orange-400" />
                    )}
                    <span className="text-orange-300 text-xs">
                      {diary.mars_diary.length} 字符
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Diary Detail */}
            <div className="lg:col-span-2">
              {selectedDiary ? (
                <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-orange-500/20">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {formatSolDate(selectedDiary.sol_number || 0)}
                      </h3>
                      <p className="text-orange-300">
                        {new Date(selectedDiary.created_at).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleShare(selectedDiary)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>分享</span>
                    </button>
                  </div>

                  {/* Mars Event */}
                  <div className="bg-orange-900/30 p-4 rounded-lg mb-6">
                    <p className="text-orange-200 text-sm mb-1">火星背景事件：</p>
                    <p className="text-orange-100">{selectedDiary.mars_event}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Original Earth Diary */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">地球日记原文</h4>
                      <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
                        <p className="text-blue-100 whitespace-pre-wrap leading-relaxed">
                          {selectedDiary.earth_diary}
                        </p>
                      </div>
                    </div>

                    {/* Mars Diary */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">火星日记</h4>
                      <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-500/20">
                        <p className="text-orange-100 whitespace-pre-wrap leading-relaxed">
                          {selectedDiary.mars_diary}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Image */}
                  {selectedDiary.image_url && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-white mb-3">火星场景</h4>
                      <div className="aspect-video bg-black/50 border border-orange-500/30 rounded-lg overflow-hidden">
                        <img
                          src={selectedDiary.image_url}
                          alt="火星场景"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-black/30 backdrop-blur-sm p-12 rounded-lg border border-orange-500/20 text-center">
                  <Calendar className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">选择一篇日记</h3>
                  <p className="text-orange-200">点击左侧的日记条目来查看详细内容</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}