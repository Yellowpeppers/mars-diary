'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// 动态导入AuthProvider，确保只在客户端加载
const AuthProvider = dynamic(
  () => import('./auth-provider').then(mod => ({ default: mod.AuthProvider })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-black flex items-center justify-center">
        <LoadingSpinner text="正在初始化火星基地..." size="lg" />
      </div>
    )
  }
)

interface ClientAuthProviderProps {
  children: React.ReactNode
}

export function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-black flex items-center justify-center">
        <LoadingSpinner text="正在连接火星网络..." size="lg" />
      </div>
    )
  }

  return <AuthProvider>{children}</AuthProvider>
}