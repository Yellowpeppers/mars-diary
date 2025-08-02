'use client'

import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PenTool, Clock, Rocket, Globe } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { FullScreenLoading } from '@/components/ui/loading-spinner'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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
    return <FullScreenLoading text="正在启动火星日记系统..." />
  }

  return (
    <div className="min-h-screen relative bg-fixed bg-center flex flex-col" style={{backgroundImage: 'url(/mars-background.png)', backgroundSize: 'cover'}}>
      {/* Enhanced dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0B0E12]/70 pointer-events-none" />
      {/* Subtle noise overlay with gray particles */}
      <div className="absolute inset-0 pointer-events-none opacity-15" 
           style={{
             background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' fill='%23CED0D3'/%3E%3C/svg%3E")`,
             maskImage: 'radial-gradient(circle, white, transparent)'
           }} />
      <Navbar />
      {/* Hero Section */}
      <div className="relative overflow-hidden flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 w-full">
          <div className="text-center">
            <div className="hero relative mb-4 md:mb-6">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="relative text-3xl md:text-6xl font-bold text-white tracking-wide"
                style={{ fontFamily: 'Oxanium, sans-serif' }}
              >
                <span className="opacity-50">写入你的今天</span><br/>
                <motion.span
                  animate={{ 
                    opacity: [1, 0.2, 1], 
                    x: [0, 2, -2, 0] 
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 8, 
                    ease: 'easeInOut' 
                  }}
                  className="text-orange-200"
                >
                  呈现你的彼岸
                </motion.span>
              </motion.h1>
              
              {/* 扫描线效果 */}
              <div className="relative h-1 mt-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200 to-transparent animate-scan" />
              </div>
            </div>
            <p className="text-lg md:text-2xl text-orange-200 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed tracking-wide" style={{fontFamily: 'Orbitron, sans-serif'}}>
              MarsMe
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/write">
                  <Button size="lg" className="relative bg-orange-200/20 backdrop-blur-md border border-orange-200/30 hover:bg-orange-200/30 hover:border-orange-200/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 w-full sm:w-auto text-white hover:text-white shadow-lg hover:shadow-xl">
                    <Rocket className="w-5 h-5 mr-2 transition-transform hover:scale-110" />
                    踏上彼岸
                  </Button>
                </Link>
                <Link href="/timeline">
                  <Button size="lg" className="bg-white/5 backdrop-blur-sm border border-orange-200/20 hover:bg-orange-200/20 hover:border-orange-200/60 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-white hover:text-white w-full sm:w-auto ring-1 ring-orange-200/20">
                    <Clock className="w-5 h-5 mr-2" />
                    查看时间线
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button size="lg" className="relative bg-orange-200/20 backdrop-blur-md border border-orange-200/30 hover:bg-orange-200/30 hover:border-orange-200/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 w-full sm:w-auto max-w-xs mx-auto text-white hover:text-white shadow-lg hover:shadow-xl">
                  <Rocket className="w-5 h-5 mr-2 transition-transform hover:scale-110" />
                  踏上彼岸
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section - Moved to Bottom */}
      <div className="mt-auto py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            <div className="group p-4 md:p-6 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-white/20 hover:border-white/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-500">
              <div className="text-2xl md:text-3xl font-bold text-white tabular-nums group-hover:scale-110 transition-transform duration-300">Sol {solTime}</div>
              <div className="text-white/80 tracking-wide mt-2 text-xs md:text-sm font-medium">火星日</div>
            </div>
            <div className="group p-4 md:p-6 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-white/20 hover:border-white/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-500">
              <div className="text-2xl md:text-3xl font-bold text-white tabular-nums group-hover:scale-110 transition-transform duration-300">24h 37m</div>
              <div className="text-white/80 tracking-wide mt-2 text-xs md:text-sm font-medium">火星一天</div>
            </div>
            <div className="group p-4 md:p-6 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-white/20 hover:border-white/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-500">
              <div className="text-2xl md:text-3xl font-bold text-white tabular-nums group-hover:scale-110 transition-transform duration-300">-80°C</div>
              <div className="text-white/80 tracking-wide mt-2 text-xs md:text-sm font-medium">平均温度</div>
            </div>
            <div className="group p-4 md:p-6 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-md border border-white/20 hover:border-white/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-500">
              <div className="text-2xl md:text-3xl font-bold text-white tabular-nums group-hover:scale-110 transition-transform duration-300">∞</div>
              <div className="text-white/80 tracking-wide mt-2 text-xs md:text-sm font-medium">探索可能</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
