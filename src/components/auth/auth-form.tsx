'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

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
      setMessage(error.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold">
            {isSignUp ? '注册账户' : '登录'}
          </h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {isSignUp ? '创建新账户开始记录火星日记' : '登录继续你的火星之旅'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-sm sm:text-base"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="text-sm sm:text-base"
            />
          </div>
          <Button
            type="submit"
            className="w-full text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? '处理中...' : (isSignUp ? '注册' : '登录')}
          </Button>
        </form>

        {message && (
          <div className={`text-center text-xs sm:text-sm ${
            message.includes('成功') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:underline text-xs sm:text-sm"
          >
            {isSignUp ? '已有账户？点击登录' : '没有账户？点击注册'}
          </button>
        </div>
      </div>
    </Card>
  )
}