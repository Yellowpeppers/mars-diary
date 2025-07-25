'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestConnection() {
  const [status, setStatus] = useState('检测中...')
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        // 测试 Supabase 连接
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus('连接失败')
          setDetails({ error: error.message })
        } else {
          setStatus('连接成功')
          setDetails({ 
            session: data.session ? '已登录' : '未登录',
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          })
        }
      } catch (err) {
        setStatus('连接异常')
        setDetails({ error: err instanceof Error ? err.message : '未知错误' })
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">连接测试</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Supabase 连接状态</h2>
          <p className="text-lg mb-4">状态: <span className={status === '连接成功' ? 'text-green-600' : 'text-red-600'}>{status}</span></p>
          
          {details && (
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">详细信息:</h3>
              <pre className="text-sm">{JSON.stringify(details, null, 2)}</pre>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <a href="/" className="text-blue-600 hover:underline">返回首页</a>
        </div>
      </div>
    </div>
  )
}