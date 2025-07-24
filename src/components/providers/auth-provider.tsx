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
    // 获取当前用户
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        await checkUserProfile(user)
      }
      
      setIsLoading(false)
    }

    getUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await checkUserProfile(session.user)
        } else {
          setUserProfile(null)
          setShowUsernameModal(false)
        }
        
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkUserProfile = async (user: User) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setUserProfile(profile)
      
      // 如果用户没有用户名，显示设置用户名的模态框
      if (!profile?.username) {
        setShowUsernameModal(true)
      }
    } catch (error) {
      console.error('获取用户档案错误:', error)
      // 如果没有档案记录，也显示设置用户名的模态框
      setShowUsernameModal(true)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
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