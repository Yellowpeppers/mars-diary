'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Rocket, ArrowLeft, Calendar, Image as ImageIcon, Share2, Loader2, RefreshCw, ChevronDown, ChevronUp, Copy, Download, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { formatSolDate } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Navbar } from '@/components/navbar'
import { supabase } from '@/lib/supabase'
import { DiaryEntry } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast, ToastContainer } from '@/components/ui/toast'
import { CardSkeleton, ImageSkeleton } from '@/components/ui/skeleton-shimmer'

export default function TimelinePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { error: showError, success: showSuccess, toasts, removeToast } = useToast()
  const [diaries, setDiaries] = useState<DiaryEntry[]>([])
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null)
  const [isLoadingDiaries, setIsLoadingDiaries] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isEarthDiaryExpanded, setIsEarthDiaryExpanded] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isAuthenticated, isLoading, router])

  // 获取用户的日记数据
  const fetchDiaries = async (isRefresh = false) => {
    if (!isAuthenticated) return
    
    try {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoadingDiaries(true)
      }
      
      // 直接获取当前session，避免额外的异步调用
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        console.error('用户未登录')
        showError('用户未登录，请重新登录')
        return
      }

      // 使用Promise.race添加超时机制，避免长时间等待
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('请求超时')), 15000) // 与认证超时保持一致
      )
      
      const fetchPromise = fetch('/api/diary/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Cache-Control': isRefresh ? 'no-cache' : 'max-age=60'
        },
      })

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response

      if (response.ok) {
        const data = await response.json()
        const sortedDiaries = (data.diaries || []).sort((a: DiaryEntry, b: DiaryEntry) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setDiaries(sortedDiaries)
        
        // 默认选择最新的日记
        if (sortedDiaries.length > 0 && !selectedDiary) {
          setSelectedDiary(sortedDiaries[0])
        }
        
        if (isRefresh) {
          showSuccess('日记列表已刷新')
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: '未知错误' }))
        console.error('获取日记失败:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error || '未知错误'
        })
        showError(`获取日记失败: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error('获取日记时出错:', error)
      if (error instanceof Error && error.message === '请求超时') {
        showError('网络连接较慢，请稍后重试或检查网络连接')
      } else {
        showError('获取日记失败，请稍后重试')
      }
    } finally {
      if (isRefresh) {
        setIsRefreshing(false)
      } else {
        setIsLoadingDiaries(false)
      }
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchDiaries()
    }
  }, [isAuthenticated])

  const handleShareText = (diary: DiaryEntry) => {
    // 只复制火星日记内容
    navigator.clipboard.writeText(diary.mars_diary)
    showSuccess('火星日记已复制到剪贴板！')
    setShowShareOptions(false)
  }

  const handleShareImage = async (diary: DiaryEntry) => {
    if (!diary.image_url) {
      showError('该日记没有图片')
      return
    }
    
    try {
      // 通过代理API下载图片
      const response = await fetch(`/api/proxy-image?imageUrl=${encodeURIComponent(diary.image_url)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const blob = await response.blob()
      
      // 检查blob类型
      if (!blob.type.startsWith('image/')) {
        throw new Error('下载的文件不是图片格式')
      }
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // 根据实际图片类型设置文件扩展名
      const extension = blob.type.split('/')[1] || 'jpg'
      link.download = `mars-diary-${formatSolDate(diary.sol_number || 0)}.${extension}`
      
      // 确保链接在DOM中
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
      
      showSuccess('图片已下载！')
      setShowShareOptions(false)
    } catch (error) {
      console.error('下载图片失败:', error)
      showError(`下载图片失败: ${error instanceof Error ? error.message : '网络错误，请稍后重试'}`)
    }
  }

  const handleDeleteDiary = async (diary: DiaryEntry) => {
    if (!confirm(`确定要删除这篇日记吗？\n\n${formatSolDate(diary.sol_number || 0)}\n\n此操作无法撤销。`)) {
      return
    }

    try {
      // 获取当前用户的访问令牌
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('用户未登录')
      }

      const response = await fetch(`/api/diary/delete?id=${diary.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '删除失败')
      }

      // 从本地状态中移除已删除的日记
      setDiaries(prevDiaries => prevDiaries.filter(d => d.id !== diary.id))
      
      // 如果删除的是当前选中的日记，选择下一个或清空选择
      if (selectedDiary?.id === diary.id) {
        const remainingDiaries = diaries.filter(d => d.id !== diary.id)
        if (remainingDiaries.length > 0) {
          setSelectedDiary(remainingDiaries[0])
        } else {
          setSelectedDiary(null)
        }
      }

      setShowShareOptions(false)
      showSuccess('日记已删除！')
    } catch (error) {
      console.error('删除日记失败:', error)
      showError(`删除日记失败: ${error instanceof Error ? error.message : '网络错误，请稍后重试'}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-black flex items-center justify-center">
        <LoadingSpinner text="正在加载火星时间线..." size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Calculate pagination
  const totalPages = Math.ceil(diaries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDiaries = diaries.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-black">
      {/* Navigation */}
      <div className="bg-white/10 backdrop-blur-sm">
        <Navbar />
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {isLoadingDiaries ? (
          // Loading state with skeleton
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <CardSkeleton key={i} className="h-24" />
                ))}
              </div>
              <div className="lg:col-span-2">
                <CardSkeleton className="h-96" />
              </div>
            </div>
          </div>
        ) : diaries.length === 0 ? (
          // Empty state
          <div className="text-center py-12 md:py-20 px-4">
            <Calendar className="h-12 w-12 md:h-16 md:w-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">还没有火星日记</h2>
            <p className="text-orange-200 mb-6 text-sm md:text-base">开始记录你在红色星球上的第一天吧！</p>
            <Link href="/write" className="bg-orange-500 hover:bg-orange-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base">
              写第一篇日记
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile View: Show either list or detail */}
            <div className="lg:hidden">
              {!selectedDiary ? (
                /* Mobile Timeline List */
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">日记时间线</h2>
                    <button
                      onClick={() => fetchDiaries(true)}
                      disabled={isRefreshing}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 text-white p-2 rounded-lg transition-colors flex items-center space-x-1"
                      title="刷新日记列表"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  {currentDiaries.map((diary) => (
                    <div
                      key={diary.id}
                      onClick={() => setSelectedDiary(diary)}
                      className="bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-orange-500/20 hover:border-orange-400/50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-orange-400 font-semibold text-base">
                          {formatSolDate(diary.sol_number || 0)}
                        </span>
                        <span className="text-orange-300 text-sm">
                          {new Date(diary.created_at).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <p className="text-white text-sm line-clamp-2 mb-2">
                        {diary.earth_diary}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {diary.image_url && (
                            <ImageIcon className="h-4 w-4 text-orange-400" />
                          )}
                          <span className="text-orange-300 text-xs">
                            {diary.mars_diary.length} 字符
                          </span>
                        </div>
                        <span className="text-orange-400 text-sm font-medium">查看详情 →</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Mobile Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 mt-6">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-white text-sm">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Mobile Diary Detail */
                <div>
                  <button
                    onClick={() => setSelectedDiary(null)}
                    className="mb-4 text-orange-400 hover:text-orange-300 flex items-center space-x-2 transition-colors"
                  >
                    <span>← 返回列表</span>
                  </button>
                  <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-orange-500/20">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {formatSolDate(selectedDiary.sol_number || 0)}
                      </h3>
                      <p className="text-orange-300 text-sm mb-4">
                        {new Date(selectedDiary.created_at).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="relative">
                        <button
                          onClick={() => setShowShareOptions(!showShareOptions)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm w-full"
                        >
                          <Share2 className="h-4 w-4" />
                          <span>分享</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${showShareOptions ? 'rotate-180' : ''}`} />
                        </button>
                        {showShareOptions && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-sm border border-orange-500/30 rounded-lg overflow-hidden z-10">
                            <button
                              onClick={() => handleShareText(selectedDiary)}
                              className="w-full px-4 py-3 text-left text-white hover:bg-orange-500/20 transition-colors flex items-center space-x-2"
                            >
                              <Copy className="h-4 w-4" />
                              <span>分享文字</span>
                            </button>
                            {selectedDiary.image_url && (
                              <button
                                onClick={() => handleShareImage(selectedDiary)}
                                className="w-full px-4 py-3 text-left text-white hover:bg-orange-500/20 transition-colors flex items-center space-x-2 border-t border-orange-500/20"
                              >
                                <Download className="h-4 w-4" />
                                <span>下载图片</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteDiary(selectedDiary)}
                              className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/20 transition-colors flex items-center space-x-2 border-t border-orange-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>删除日记</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mars Event */}
                    <div className="bg-orange-900/30 p-3 rounded-lg mb-4">
                      <p className="text-orange-200 text-xs mb-1">火星背景事件：</p>
                      <p className="text-orange-100 text-sm">{selectedDiary.mars_event}</p>
                    </div>

                    {/* Original Earth Diary - Collapsible */}
                    <div className="mb-4">
                      <button
                        onClick={() => setIsEarthDiaryExpanded(!isEarthDiaryExpanded)}
                        className="flex items-center justify-between w-full text-left mb-2 text-base font-semibold text-white hover:text-orange-300 transition-colors"
                      >
                        <span>地球日记原文</span>
                        {isEarthDiaryExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      {isEarthDiaryExpanded && (
                        <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/20">
                          <p className="text-blue-100 whitespace-pre-wrap leading-relaxed text-sm">
                            {selectedDiary.earth_diary}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Mars Diary */}
                    <div className="mb-4">
                      <h4 className="text-base font-semibold text-white mb-2">火星日记</h4>
                      <div className="bg-orange-900/20 p-3 rounded-lg border border-orange-500/20">
                        <p className="text-orange-100 whitespace-pre-wrap leading-relaxed text-sm">
                          {selectedDiary.mars_diary}
                        </p>
                      </div>
                    </div>

                    {/* Image */}
                    {selectedDiary.image_url && (
                      <div>
                        <h4 className="text-base font-semibold text-white mb-2">火星场景</h4>
                        <div className="aspect-video bg-black/50 border border-orange-500/30 rounded-lg overflow-hidden">
                          <img
                            src={`/api/proxy-image?imageUrl=${encodeURIComponent(selectedDiary.image_url)}`}
                            alt="火星场景"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              if (selectedDiary.image_url) {
                                e.currentTarget.src = selectedDiary.image_url
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop View: Side by side layout */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-8">
              {/* Timeline List */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">日记时间线</h2>
                  <button
                    onClick={() => fetchDiaries(true)}
                    disabled={isRefreshing}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 text-white p-2 rounded-lg transition-colors flex items-center space-x-1"
                    title="刷新日记列表"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                {currentDiaries.map((diary) => (
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
                      <span className="text-orange-400 font-semibold text-base">
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
                
                {/* Desktop Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-white text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Diary Detail */}
              <div className="lg:col-span-2">
                {selectedDiary ? (
                  <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-orange-500/20">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-3 sm:space-y-0">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {formatSolDate(selectedDiary.sol_number || 0)}
                        </h3>
                        <p className="text-orange-300 text-base">
                          {new Date(selectedDiary.created_at).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setShowShareOptions(!showShareOptions)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-base w-full sm:w-auto"
                        >
                          <Share2 className="h-4 w-4" />
                          <span>分享</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${showShareOptions ? 'rotate-180' : ''}`} />
                        </button>
                        {showShareOptions && (
                          <div className="absolute top-full right-0 mt-2 bg-black/90 backdrop-blur-sm border border-orange-500/30 rounded-lg overflow-hidden z-10 min-w-[160px]">
                            <button
                              onClick={() => handleShareText(selectedDiary)}
                              className="w-full px-4 py-3 text-left text-white hover:bg-orange-500/20 transition-colors flex items-center space-x-2"
                            >
                              <Copy className="h-4 w-4" />
                              <span>分享文字</span>
                            </button>
                            {selectedDiary.image_url && (
                              <button
                                onClick={() => handleShareImage(selectedDiary)}
                                className="w-full px-4 py-3 text-left text-white hover:bg-orange-500/20 transition-colors flex items-center space-x-2 border-t border-orange-500/20"
                              >
                                <Download className="h-4 w-4" />
                                <span>下载图片</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mars Event */}
                    <div className="bg-orange-900/30 p-4 rounded-lg mb-6">
                      <p className="text-orange-200 text-sm mb-1">火星背景事件：</p>
                      <p className="text-orange-100 text-base">{selectedDiary.mars_event}</p>
                    </div>

                    {/* Original Earth Diary - Collapsible */}
                    <div className="mb-6">
                      <button
                        onClick={() => setIsEarthDiaryExpanded(!isEarthDiaryExpanded)}
                        className="flex items-center justify-between w-full text-left mb-3 text-lg font-semibold text-white hover:text-orange-300 transition-colors"
                      >
                        <span>地球日记原文</span>
                        {isEarthDiaryExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      {isEarthDiaryExpanded && (
                        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
                          <p className="text-blue-100 whitespace-pre-wrap leading-relaxed text-base">
                            {selectedDiary.earth_diary}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Mars Diary */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-white mb-3">火星日记</h4>
                      <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-500/20">
                        <p className="text-orange-100 whitespace-pre-wrap leading-relaxed text-base">
                          {selectedDiary.mars_diary}
                        </p>
                      </div>
                    </div>

                    {/* Image */}
                    {selectedDiary.image_url && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">火星场景</h4>
                        <div className="aspect-video bg-black/50 border border-orange-500/30 rounded-lg overflow-hidden">
                          <img
                            src={`/api/proxy-image?imageUrl=${encodeURIComponent(selectedDiary.image_url)}`}
                            alt="火星场景"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              if (selectedDiary.image_url) {
                                e.currentTarget.src = selectedDiary.image_url
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-black/30 backdrop-blur-sm p-12 rounded-lg border border-orange-500/20 text-center">
                    <Calendar className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">选择一篇日记</h3>
                    <p className="text-orange-200 text-base">点击左侧的日记条目来查看详细内容</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}