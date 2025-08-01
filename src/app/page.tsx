'use client'

import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PenTool, Clock, Rocket, Globe } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useState, useEffect } from 'react'

export default function Home() {
  const { user, isLoading } = useAuth()
  const [solTime, setSolTime] = useState(1)

  // 实时Sol计时器
  useEffect(() => {
    const interval = setInterval(() => {
      setSolTime(prev => Math.floor(prev + 1.027))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-black flex items-center justify-center">
        <LoadingSpinner text="正在启动火星日记系统..." size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-fixed bg-center" style={{backgroundImage: 'url(/mars-background.png)', backgroundSize: 'cover'}}>
      {/* Enhanced dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0B0E12]/70 pointer-events-none" />
      {/* Subtle noise overlay */}
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-15" 
           style={{
             background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
             maskImage: 'radial-gradient(circle, white, transparent)'
           }} />
      <Navbar />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          <div className="text-center">
            <h1 className="relative text-3xl md:text-6xl font-bold text-white mb-4 md:mb-6 drop-shadow-[0_0_6px_#E85C35] tracking-wide after:absolute after:inset-0 after:bg-[radial-gradient(circle,#e85c3544,transparent_70%)] after:rounded-full after:-z-10">
              🚀 火星日记模拟器
            </h1>
            <p className="text-lg md:text-2xl text-orange-200 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed tracking-wide">
              将你的地球日记转换为火星殖民者的生活记录，体验红色星球上的奇妙冒险
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/write">
                  <Button size="lg" className="relative bg-[#E85C35]/90 hover:bg-[#E85C35] hover:shadow-[0_0_20px_#E85C35] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 w-full sm:w-auto before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-[#e85c35]/80 before:blur-sm before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
                    <Rocket className="w-5 h-5 mr-2 transition-transform hover:scale-110" />
                    开始写日记
                  </Button>
                </Link>
                <Link href="/timeline">
                  <Button size="lg" className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#E85C35]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-white hover:text-white w-full sm:w-auto ring-1 ring-white/10">
                    <Clock className="w-5 h-5 mr-2" />
                    查看时间线
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button size="lg" className="relative bg-[#E85C35]/90 hover:bg-[#E85C35] hover:shadow-[0_0_20px_#E85C35] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 w-full sm:w-auto max-w-xs mx-auto before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-[#e85c35]/80 before:blur-sm before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
                  <Rocket className="w-5 h-5 mr-2 transition-transform hover:scale-110" />
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
          <Card className="p-6 text-center bg-white/5 backdrop-blur border border-white/10 hover:border-[#E85C35]/40 hover:-translate-y-1 hover:shadow-[0_0_15px_#e85c3544] transition-all duration-300 rounded-2xl">
            <Rocket className="w-12 h-12 text-[#E85C35] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">AI 智能转换</h3>
            <p className="text-orange-200">
              使用先进的 AI 技术，将你的日常生活转换为火星殖民者的精彩经历
            </p>
          </Card>
          
          <Card className="p-6 text-center bg-white/5 backdrop-blur border border-white/10 hover:border-[#E85C35]/40 hover:-translate-y-1 hover:shadow-[0_0_15px_#e85c3544] transition-all duration-300 rounded-2xl">
            <Clock className="w-12 h-12 text-[#E85C35] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">火星时间</h3>
            <p className="text-orange-200">
              体验火星的 Sol 时间系统，感受红色星球上独特的日夜循环
            </p>
          </Card>
          
          <Card className="p-6 text-center bg-white/5 backdrop-blur border border-white/10 hover:border-[#E85C35]/40 hover:-translate-y-1 hover:shadow-[0_0_15px_#e85c3544] transition-all duration-300 rounded-2xl">
            <Globe className="w-12 h-12 text-[#E85C35] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">场景生成</h3>
            <p className="text-orange-200">
              自动生成与你的火星日记相匹配的精美场景图片
            </p>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-12 md:py-16">
        {/* Section background with enhanced glass effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0B0E12]/30 to-black/40 backdrop-blur border-t border-white/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-white/20 hover:border-[#E85C35]/60 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(232,92,53,0.3)] transition-all duration-500">
              <div className="text-3xl font-bold text-[#E85C35] tabular-nums drop-shadow-[0_0_8px_#E85C35] group-hover:scale-110 transition-transform duration-300">Sol {solTime}</div>
              <div className="text-orange-100 tracking-wide mt-2 text-sm font-medium">火星日</div>
            </div>
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-white/20 hover:border-[#E85C35]/60 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(232,92,53,0.3)] transition-all duration-500">
              <div className="text-3xl font-bold text-[#E85C35] tabular-nums drop-shadow-[0_0_8px_#E85C35] group-hover:scale-110 transition-transform duration-300">24h 37m</div>
              <div className="text-orange-100 tracking-wide mt-2 text-sm font-medium">火星一天</div>
            </div>
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-white/20 hover:border-[#E85C35]/60 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(232,92,53,0.3)] transition-all duration-500">
              <div className="text-3xl font-bold text-[#E85C35] tabular-nums drop-shadow-[0_0_8px_#E85C35] group-hover:scale-110 transition-transform duration-300">-80°C</div>
              <div className="text-orange-100 tracking-wide mt-2 text-sm font-medium">平均温度</div>
            </div>
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-white/20 hover:border-[#E85C35]/60 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(232,92,53,0.3)] transition-all duration-500">
              <div className="text-3xl font-bold text-[#E85C35] tabular-nums drop-shadow-[0_0_8px_#E85C35] group-hover:scale-110 transition-transform duration-300">∞</div>
              <div className="text-orange-100 tracking-wide mt-2 text-sm font-medium">探索可能</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
