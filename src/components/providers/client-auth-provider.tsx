'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { FullScreenLoading } from '@/components/ui/loading-spinner'

// 动态导入AuthProvider，确保只在客户端加载
const AuthProvider = dynamic(
  () => import('./auth-provider').then(mod => ({ default: mod.AuthProvider })),
  { 
    ssr: false,
    loading: () => <FullScreenLoading text="Initializing Mars Base..." />
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
    return <FullScreenLoading text="Connecting to Mars Network..." />
  }

  return <AuthProvider>{children}</AuthProvider>
}