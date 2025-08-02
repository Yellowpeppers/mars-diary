'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { AuthForm } from '@/components/auth/auth-form'
import { FullScreenLoading } from '@/components/ui/loading-spinner'

export default function SignIn() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <FullScreenLoading text="Authenticating Mars Access..." />
  }

  if (user) {
    return null // 重定向中
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4" style={{backgroundImage: 'url(/Google_AI_Studio_2025-08-01T04_46_32.501Z.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      {/* Enhanced background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 pointer-events-none" />
      {/* Mars horizon mist gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B0E12]/80 pointer-events-none" />
      {/* Subtle particle effect for non-reduced motion */}
      <div className="absolute inset-0 pointer-events-none opacity-10 motion-reduce:hidden" 
           style={{
             background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
             maskImage: 'radial-gradient(circle, white, transparent)'
           }} />
      
      <div className="flex flex-col items-center relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 text-[#E85C35]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white" style={{fontFamily: 'Orbitron, monospace'}}>MarsMe</h1>
          </div>
          <p className="text-orange-200 text-lg font-light tracking-wide">Tell me your day & I'll unveil your beyond</p>
        </div>
        
        <AuthForm onAuthSuccess={() => router.push('/')} />
      </div>
    </div>
  )
}