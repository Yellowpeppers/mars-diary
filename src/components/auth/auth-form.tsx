'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

interface AuthFormProps {
  onAuthSuccess?: () => void
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('注册成功！请检查邮箱验证链接。')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setMessage('登录成功！')
        onAuthSuccess?.()
      }
    } catch (error: any) {
      setMessage(error.message || '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-80 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_0_20px_#000a]">
      <form onSubmit={handleAuth} className="flex flex-col gap-4">
        {/* 邮箱 */}
        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder=" "
            className="peer h-12 w-full bg-black/60 rounded-md px-3 text-white placeholder-transparent focus:ring-2 focus:ring-[#E85C35]/60 transition border-0 outline-none flex items-center"
          />
          <label
            htmlFor="email"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9ca3af] transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:opacity-0 peer-valid:top-2 peer-valid:translate-y-0 peer-valid:text-xs peer-valid:opacity-0"
          >
            邮箱
          </label>
        </div>
        
        {/* 密码 */}
        <div className="relative">
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder=" "
            className="peer h-12 w-full bg-black/60 rounded-md px-3 text-white placeholder-transparent focus:ring-2 focus:ring-[#E85C35]/60 transition border-0 outline-none flex items-center"
          />
          <label
            htmlFor="password"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9ca3af] transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:opacity-0 peer-valid:top-2 peer-valid:translate-y-0 peer-valid:text-xs peer-valid:opacity-0"
          >
            密码
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-md bg-orange-200/20 backdrop-blur-md border border-orange-200/30 hover:bg-orange-200/30 hover:border-orange-200/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-white hover:text-white shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>处理中...</span>
            </div>
          ) : (
             isSignUp ? '注册' : '点火进入'
           )}
        </button>
      </form>
      {message && (
        <div className="mt-4 p-3 text-sm text-center bg-black/30 border border-white/10 rounded-lg text-white/90">
          {message}
        </div>
      )}
      <div className="mt-5 text-center text-xs text-[#9CA3AF]">
        {isSignUp ? '已有账号？' : '没有账号？'}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="underline hover:text-white transition-colors ml-1"
        >
          {isSignUp ? '点击登录' : '点击注册'} →
        </button>
      </div>
    </div>
  )
}