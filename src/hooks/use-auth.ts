'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = () => {
    router.push('/auth/signin')
  }

  const logout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const loginWithGoogle = () => {
    signIn('google', { callbackUrl: '/' })
  }

  const loginWithEmail = (email: string) => {
    signIn('email', { email, callbackUrl: '/' })
  }

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    login,
    logout,
    loginWithGoogle,
    loginWithEmail,
  }
}