'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UsernameModal } from '@/components/username-modal'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
  userProfile: any
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
  userProfile: null,
})

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [showUsernameModal, setShowUsernameModal] = useState(false)

  useEffect(() => {
    // 获取初始会话
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          await checkUserProfile(session.user)
        }
      } catch (error) {
        console.error('获取初始会话失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          setUserProfile(null)
          setShowUsernameModal(false)
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session.user)
          if (session.user) {
            await checkUserProfile(session.user)
          }
        }
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkUserProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        setUserProfile(null)
        return
      }

      setUserProfile(profile)
      
      if (!profile?.username) {
        setShowUsernameModal(true)
      }
    } catch (error) {
      setUserProfile(null)
    }
  }

  const signOut = async () => {
    setUser(null)
    setUserProfile(null)
    setShowUsernameModal(false)
    
    try {
      await supabase.auth.signOut()
    } catch (error) {
      // 忽略登出错误，本地状态已清理
    }
  }

  const handleUsernameSuccess = (username: string) => {
    setUserProfile({ ...userProfile, username })
    setShowUsernameModal(false)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut, userProfile }}>
      {children}
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onSuccess={handleUsernameSuccess}
      />
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}