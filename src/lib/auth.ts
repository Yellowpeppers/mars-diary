// 认证相关的工具函数和类型定义
import { supabase } from './supabase'

// 认证状态检查
export const checkAuthStatus = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// 登录函数
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

// 注册函数
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

// 登出函数
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// 用户类型定义
export interface AuthUser {
  id: string
  email?: string
  created_at?: string
}