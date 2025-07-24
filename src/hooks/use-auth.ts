'use client'

import { useContext } from 'react'
import { AuthContext } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const context = useContext(AuthContext)
  const router = useRouter()

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  const { user, isLoading, signOut, userProfile } = context

  const login = () => {
    router.push('/auth/signin')
  }

  const logout = async () => {
    await signOut()
    router.push('/')
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    userProfile,
  }
}