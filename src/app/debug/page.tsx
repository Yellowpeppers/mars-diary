'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface DiagnosticResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'loading'
  message: string
  details?: string
}

export default function DebugPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const results: DiagnosticResult[] = []

    // 1. 检查认证状态
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        results.push({
          name: '认证会话',
          status: 'error',
          message: '获取会话失败',
          details: error.message
        })
      } else if (session?.user) {
        results.push({
          name: '认证会话',
          status: 'success',
          message: `用户已登录: ${session.user.email}`,
          details: `用户ID: ${session.user.id}, 令牌过期时间: ${new Date(session.expires_at! * 1000).toLocaleString()}`
        })
      } else {
        results.push({
          name: '认证会话',
          status: 'warning',
          message: '用户未登录',
          details: '需要登录才能使用完整功能'
        })
      }
    } catch (err) {
      results.push({
        name: '认证会话',
        status: 'error',
        message: '认证检查异常',
        details: err instanceof Error ? err.message : String(err)
      })
    }

    // 2. 检查Supabase连接
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      if (error) {
        results.push({
          name: 'Supabase数据库',
          status: 'error',
          message: '数据库连接失败',
          details: error.message
        })
      } else {
        results.push({
          name: 'Supabase数据库',
          status: 'success',
          message: '数据库连接正常',
          details: '可以正常访问profiles表'
        })
      }
    } catch (err) {
      results.push({
        name: 'Supabase数据库',
        status: 'error',
        message: 'Supabase连接异常',
        details: err instanceof Error ? err.message : String(err)
      })
    }

    // 3. 检查日记表
    try {
      const { data, error } = await supabase.from('diary_entries').select('count').limit(1)
      if (error) {
        if (error.message.includes('relation "diary_entries" does not exist')) {
          results.push({
            name: '日记数据表',
            status: 'error',
            message: '日记表不存在',
            details: '需要执行supabase-setup.sql脚本创建数据库表'
          })
        } else {
          results.push({
            name: '日记数据表',
            status: 'error',
            message: '日记表访问失败',
            details: error.message
          })
        }
      } else {
        results.push({
          name: '日记数据表',
          status: 'success',
          message: '日记表正常',
          details: '可以正常访问diary_entries表'
        })
      }
    } catch (err) {
      results.push({
        name: '日记数据表',
        status: 'error',
        message: '日记表检查异常',
        details: err instanceof Error ? err.message : String(err)
      })
    }

    // 4. 检查API密钥配置
    try {
      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ earthDiary: '测试日记内容，用于检查API配置是否正常工作。' })
      })
      
      if (response.ok) {
        results.push({
          name: 'Gemini API',
          status: 'success',
          message: 'Gemini API配置正常',
          details: '可以正常生成火星日记'
        })
      } else {
        const errorData = await response.json()
        results.push({
          name: 'Gemini API',
          status: 'error',
          message: 'Gemini API配置异常',
          details: errorData.error || '未知错误'
        })
      }
    } catch (err) {
      results.push({
        name: 'Gemini API',
        status: 'error',
        message: 'Gemini API检查失败',
        details: err instanceof Error ? err.message : String(err)
      })
    }

    // 5. 检查图像生成API
    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marsDiary: '测试火星日记内容，用于检查图像生成API配置。' })
      })
      
      if (response.ok) {
        results.push({
          name: '豆包图像API',
          status: 'success',
          message: '豆包API配置正常',
          details: '可以正常生成图像'
        })
      } else {
        const errorData = await response.json()
        results.push({
          name: '豆包图像API',
          status: 'error',
          message: '豆包API配置异常',
          details: errorData.error || '未知错误'
        })
      }
    } catch (err) {
      results.push({
        name: '豆包图像API',
        status: 'error',
        message: '豆包API检查失败',
        details: err instanceof Error ? err.message : String(err)
      })
    }

    // 6. 检查保存API（如果用户已登录）
    if (user) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          const response = await fetch('/api/diary/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              earthDiary: '测试地球日记',
              marsDiary: '测试火星日记',
              marsEvent: '测试火星事件'
            })
          })
          
          if (response.ok) {
            results.push({
              name: '日记保存API',
              status: 'success',
              message: '日记保存功能正常',
              details: '可以正常保存日记到数据库'
            })
          } else {
            const errorData = await response.json()
            results.push({
              name: '日记保存API',
              status: 'error',
              message: '日记保存失败',
              details: errorData.error || '未知错误'
            })
          }
        } else {
          results.push({
            name: '日记保存API',
            status: 'warning',
            message: '无法获取访问令牌',
            details: '用户会话可能已过期'
          })
        }
      } catch (err) {
        results.push({
          name: '日记保存API',
          status: 'error',
          message: '日记保存检查失败',
          details: err instanceof Error ? err.message : String(err)
        })
      }
    }

    setDiagnostics(results)
    setIsRunning(false)
  }

  useEffect(() => {
    if (!authLoading) {
      runDiagnostics()
    }
  }, [authLoading])

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'loading':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-500/50 bg-green-900/20'
      case 'error':
        return 'border-red-500/50 bg-red-900/20'
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-900/20'
      case 'loading':
        return 'border-blue-500/50 bg-blue-900/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-black">
      <div className="bg-white/10 backdrop-blur-sm">
        <Navbar />
      </div>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">🔧 系统诊断</h1>
            <p className="text-orange-200">检查火星日记系统的各项功能状态</p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  诊断中...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新诊断
                </>
              )}
            </Button>
          </div>

          <div className="grid gap-4">
            {diagnostics.map((result, index) => (
              <Card key={index} className={`border ${getStatusColor(result.status)} bg-black/30 backdrop-blur-sm`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-3 text-white">
                    {getStatusIcon(result.status)}
                    <span>{result.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-200 mb-2">{result.message}</p>
                  {result.details && (
                    <p className="text-orange-300/70 text-sm font-mono bg-black/30 p-2 rounded">
                      {result.details}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {diagnostics.length > 0 && (
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-orange-500/20">
              <h2 className="text-xl font-bold text-white mb-4">🛠️ 问题解决建议</h2>
              <div className="space-y-4 text-orange-200">
                {diagnostics.some(d => d.name === '日记数据表' && d.status === 'error') && (
                  <div className="bg-red-900/20 p-4 rounded border border-red-500/30">
                    <h3 className="font-semibold text-red-200 mb-2">数据库表缺失</h3>
                    <p className="text-sm">请在Supabase控制台执行以下SQL脚本创建必要的数据库表：</p>
                    <code className="block mt-2 p-2 bg-black/50 rounded text-xs">supabase-setup.sql</code>
                  </div>
                )}
                
                {diagnostics.some(d => d.name === 'Gemini API' && d.status === 'error') && (
                  <div className="bg-red-900/20 p-4 rounded border border-red-500/30">
                    <h3 className="font-semibold text-red-200 mb-2">Gemini API配置问题</h3>
                    <p className="text-sm">请检查.env.local文件中的GEMINI_API_KEY是否正确配置。</p>
                  </div>
                )}
                
                {diagnostics.some(d => d.name === '豆包图像API' && d.status === 'error') && (
                  <div className="bg-red-900/20 p-4 rounded border border-red-500/30">
                    <h3 className="font-semibold text-red-200 mb-2">豆包API配置问题</h3>
                    <p className="text-sm">请检查.env.local文件中的ARK_API_KEY是否正确配置。</p>
                  </div>
                )}
                
                {diagnostics.some(d => d.name === '认证会话' && d.status === 'warning') && (
                  <div className="bg-yellow-900/20 p-4 rounded border border-yellow-500/30">
                    <h3 className="font-semibold text-yellow-200 mb-2">用户未登录</h3>
                    <p className="text-sm">请先登录账户才能使用完整的日记功能。</p>
                  </div>
                )}
                
                {diagnostics.some(d => d.name === '日记保存API' && d.status === 'error') && (
                  <div className="bg-red-900/20 p-4 rounded border border-red-500/30">
                    <h3 className="font-semibold text-red-200 mb-2">认证令牌问题</h3>
                    <p className="text-sm">用户会话可能已过期，请尝试重新登录。</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}