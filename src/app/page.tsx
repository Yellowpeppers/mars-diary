'use client'

import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PenTool, Clock, Rocket, Globe } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function Home() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-black flex items-center justify-center">
        <LoadingSpinner text="正在启动火星日记系统..." size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-black">
      <Navbar />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          <div className="text-center">
            <h1 className="text-3xl md:text-6xl font-bold text-white mb-4 md:mb-6">
              🚀 火星日记模拟器
            </h1>
            <p className="text-lg md:text-2xl text-orange-200 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
              将你的地球日记转换为火星殖民者的生活记录，体验红色星球上的奇妙冒险
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/write">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
                    <PenTool className="w-5 h-5 mr-2" />
                    开始写日记
                  </Button>
                </Link>
                <Link href="/timeline">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Clock className="w-5 h-5 mr-2" />
                    查看时间线
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto max-w-xs mx-auto">
                  开始火星之旅
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <Card className="p-6 text-center bg-black/30 backdrop-blur-sm border-orange-500/20">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2 text-white">AI 智能转换</h3>
            <p className="text-orange-200">
              使用先进的 AI 技术，将你的日常生活转换为火星殖民者的精彩经历
            </p>
          </Card>
          
          <Card className="p-6 text-center bg-black/30 backdrop-blur-sm border-orange-500/20">
            <div className="text-4xl mb-4">🌅</div>
            <h3 className="text-xl font-semibold mb-2 text-white">火星时间</h3>
            <p className="text-orange-200">
              体验火星的 Sol 时间系统，感受红色星球上独特的日夜循环
            </p>
          </Card>
          
          <Card className="p-6 text-center bg-black/30 backdrop-blur-sm border-orange-500/20">
            <div className="text-4xl mb-4">🖼️</div>
            <h3 className="text-xl font-semibold mb-2 text-white">场景生成</h3>
            <p className="text-orange-200">
              自动生成与你的火星日记相匹配的精美场景图片
            </p>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-black/20 backdrop-blur-sm py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-400">Sol 1</div>
              <div className="text-orange-200">火星日</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400">24h 37m</div>
              <div className="text-orange-200">火星一天</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400">-80°C</div>
              <div className="text-orange-200">平均温度</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400">∞</div>
              <div className="text-orange-200">探索可能</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
