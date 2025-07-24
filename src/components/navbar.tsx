'use client'

import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { PenTool, Clock, User, LogOut } from 'lucide-react'

export function Navbar() {
  const { user, loading, signOut } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl">🚀</div>
              <span className="text-xl font-bold text-orange-600">火星日记</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!loading && user ? (
              <>
                <Link href="/write">
                  <Button variant="ghost" size="sm">
                    <PenTool className="w-4 h-4 mr-2" />
                    写日记
                  </Button>
                </Link>
                <Link href="/timeline">
                  <Button variant="ghost" size="sm">
                    <Clock className="w-4 h-4 mr-2" />
                    时间线
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm text-gray-600">
                    {user.email}
                  </span>
                </div>
                <Button
                  onClick={signOut}
                  variant="ghost"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出
                </Button>
              </>
            ) : !loading ? (
              <Link href="/auth/signin">
                <Button size="sm">
                  登录
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  )
}