'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { X, User } from 'lucide-react'

interface UsernameModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (username: string) => void
}

export function UsernameModal({ isOpen, onClose, onSuccess }: UsernameModalProps) {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (username.trim().length < 2) {
      setError('用户名至少需要2个字符')
      return
    }

    if (username.trim().length > 20) {
      setError('用户名不能超过20个字符')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('用户未认证')
      }

      // 检查用户名是否已存在
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.trim())
        .single()

      // 如果表不存在，跳过检查
      if (checkError && checkError.message.includes('relation "profiles" does not exist')) {
        console.warn('档案表不存在，跳过用户名检查')
        onSuccess(username.trim())
        onClose()
        return
      }

      if (existingUser) {
        setError('用户名已被使用，请选择其他用户名')
        setIsLoading(false)
        return
      }

      // 创建或更新用户档案
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username.trim(),
          email: user.email,
          updated_at: new Date().toISOString()
        })

      // 如果表不存在，也认为成功
      if (upsertError && upsertError.message.includes('relation "profiles" does not exist')) {
        console.warn('档案表不存在，但用户名设置成功')
        onSuccess(username.trim())
        onClose()
        return
      }

      if (upsertError) {
        throw upsertError
      }

      onSuccess(username.trim())
      onClose()
    } catch (err) {
      console.error('设置用户名错误:', err)
      setError(err instanceof Error ? err.message : '设置用户名失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-orange-900 to-red-900 p-6 rounded-lg border border-orange-500/30 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-orange-100 flex items-center">
            <User className="w-6 h-6 mr-2" />
            设置用户名
          </h2>
          <button
            onClick={onClose}
            className="text-orange-200 hover:text-orange-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-orange-200 mb-4">
          欢迎来到火星！请设置一个用户名来完成你的火星殖民者身份注册。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-orange-200 text-sm font-medium mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入你的火星殖民者代号..."
              className="w-full p-3 bg-black/50 border border-orange-500/30 rounded-lg text-white placeholder-orange-300/60 focus:outline-none focus:border-orange-400"
              maxLength={20}
              required
            />
            <p className="text-orange-300/70 text-xs mt-1">
              {username.length}/20 字符
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500/50 p-3 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-orange-500/30 text-orange-200 hover:bg-orange-800/30"
            >
              稍后设置
            </Button>
            <Button
              type="submit"
              disabled={isLoading || username.trim().length < 2}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600"
            >
              {isLoading ? '设置中...' : '确认设置'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}