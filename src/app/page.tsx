'use client'

import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PenTool, Clock, Rocket, Globe } from 'lucide-react'
import { Navbar } from '@/components/navbar'

export default function Home() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <Navbar />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              🚀 火星日记模拟器
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              将你的地球日记转换为火星殖民者的生活记录，体验红色星球上的奇妙冒险
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/write">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                    <PenTool className="w-5 h-5 mr-2" />
                    开始写日记
                  </Button>
                </Link>
                <Link href="/timeline">
                  <Button size="lg" variant="outline">
                    <Clock className="w-5 h-5 mr-2" />
                    查看时间线
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  开始火星之旅
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI 智能转换</h3>
            <p className="text-gray-600">
              使用先进的 AI 技术，将你的日常生活转换为火星殖民者的精彩经历
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-4xl mb-4">🌅</div>
            <h3 className="text-xl font-semibold mb-2">火星时间</h3>
            <p className="text-gray-600">
              体验火星的 Sol 时间系统，感受红色星球上独特的日夜循环
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-4xl mb-4">🖼️</div>
            <h3 className="text-xl font-semibold mb-2">场景生成</h3>
            <p className="text-gray-600">
              自动生成与你的火星日记相匹配的精美场景图片
            </p>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-600">Sol 1</div>
              <div className="text-gray-600">火星日</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">24h 37m</div>
              <div className="text-gray-600">火星一天</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">-80°C</div>
              <div className="text-gray-600">平均温度</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">∞</div>
              <div className="text-gray-600">探索可能</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
