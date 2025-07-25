'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function StatusPage() {
  const [status, setStatus] = useState({
    supabase: 'checking...',
    auth: 'checking...',
    timestamp: new Date().toISOString()
  })

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // 测试 Supabase 连接
        const { data, error } = await supabase.from('profiles').select('count').limit(1)
        if (error) {
          setStatus(prev => ({ ...prev, supabase: `Error: ${error.message}` }))
        } else {
          setStatus(prev => ({ ...prev, supabase: 'Connected' }))
        }
      } catch (err) {
        setStatus(prev => ({ ...prev, supabase: `Connection failed: ${err}` }))
      }

      try {
        // 测试认证
        const { data: { user } } = await supabase.auth.getUser()
        setStatus(prev => ({ ...prev, auth: user ? 'Authenticated' : 'Not authenticated' }))
      } catch (err) {
        setStatus(prev => ({ ...prev, auth: `Auth error: ${err}` }))
      }
    }

    checkStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">系统状态检查</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <strong>Supabase 连接:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-sm ${
              status.supabase === 'Connected' ? 'bg-green-100 text-green-800' : 
              status.supabase === 'checking...' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {status.supabase}
            </span>
          </div>
          
          <div>
            <strong>认证状态:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-sm ${
              status.auth === 'Authenticated' ? 'bg-green-100 text-green-800' :
              status.auth === 'Not authenticated' ? 'bg-blue-100 text-blue-800' :
              status.auth === 'checking...' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {status.auth}
            </span>
          </div>
          
          <div>
            <strong>检查时间:</strong> {status.timestamp}
          </div>
          
          <div className="pt-4 border-t">
            <a href="/" className="text-blue-600 hover:underline">← 返回首页</a>
          </div>
        </div>
      </div>
    </div>
  )
}