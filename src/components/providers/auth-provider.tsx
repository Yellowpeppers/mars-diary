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
    // 设置超时机制，避免无限加载
    const timeout = setTimeout(() => {
      console.warn('认证超时，强制设置为未加载状态')
      setIsLoading(false)
    }, 10000) // 10秒超时

    // 初始化认证状态
    const initializeAuth = async () => {
      try {
        // 首先尝试获取当前会话
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.warn('获取会话失败:', sessionError.message)
          // 会话错误不应该阻止初始化，继续尝试获取用户
        }

        if (session?.user) {
          console.log('找到有效会话，用户ID:', session.user.id)
          setUser(session.user)
          await checkUserProfile(session.user)
        } else {
          console.log('没有有效会话，尝试获取用户信息')
          // 如果没有会话，尝试获取用户信息
          try {
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (userError) {
              // 如果是AuthSessionMissingError，这是正常的（用户未登录）
              if (userError.message.includes('Auth session missing')) {
                console.log('用户未登录（正常状态）')
              } else {
                console.error('获取用户信息失败:', userError.message)
              }
            } else if (user) {
              console.log('找到用户信息，用户ID:', user.id)
              setUser(user)
              await checkUserProfile(user)
            } else {
              console.log('没有找到用户信息')
            }
          } catch (error: any) {
            console.warn('获取用户信息异常:', error.message)
          }
        }
        
        clearTimeout(timeout)
        setIsLoading(false)
      } catch (error) {
        console.error('初始化认证失败:', error)
        clearTimeout(timeout)
        setIsLoading(false)
      }
    }

    initializeAuth()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('认证状态变化:', event, session?.user?.id)
        
        try {
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
          
          clearTimeout(timeout)
          setIsLoading(false)
        } catch (error) {
          console.error('认证状态变化处理失败:', error)
          clearTimeout(timeout)
          setIsLoading(false)
        }
      }
    )

    return () => {
      clearTimeout(timeout)
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
        // 如果表不存在或其他错误，跳过档案检查
        console.warn('档案表可能不存在，跳过档案检查:', error.message)
        setUserProfile(null)
        return
      }

      setUserProfile(profile)
      
      // 如果用户没有用户名，显示设置用户名的模态框
      if (!profile?.username) {
        setShowUsernameModal(true)
      }
    } catch (error) {
      console.error('获取用户档案错误:', error)
      // 如果没有档案记录，设置为 null 但不显示模态框
      setUserProfile(null)
    }
  }

  const signOut = async () => {
    try {
      // 立即清理本地状态
      setUser(null)
      setUserProfile(null)
      setShowUsernameModal(false)
      
      // 调用 Supabase 登出
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('登出错误:', error.message)
      }
    } catch (error) {
      console.error('登出异常:', error)
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