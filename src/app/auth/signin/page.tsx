'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { AuthForm } from '@/components/auth/auth-form'

export default function SignIn() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-900 via-red-900 to-black">
        <div className="text-white text-xl">加载中...</div>
      </div>
    )
  }

  if (user) {
    return null // 重定向中
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4" style={{backgroundImage: 'url(/Google_AI_Studio_2025-08-01T04_46_32.501Z.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🚀 火星日记</h1>
          <p className="text-red-100">记录你的火星探索之旅</p>
        </div>
        
        <AuthForm onAuthSuccess={() => router.push('/')} />
      </div>
    </div>
  )
}