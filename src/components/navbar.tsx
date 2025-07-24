'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { PenTool, Clock, User, LogOut } from 'lucide-react'

export function Navbar() {
  const { user, isLoading, logout, userProfile } = useAuth()

  return (
    <nav className="bg-gradient-to-r from-orange-900/90 to-red-900/90 backdrop-blur-sm border-b border-orange-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl">🚀</div>
              <span className="text-xl font-bold text-orange-100">火星日记</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!isLoading && user ? (
              <>
                <Link href="/write">
                  <Button variant="ghost" size="sm" className="text-orange-100 hover:text-orange-200 hover:bg-orange-800/50">
                    <PenTool className="w-4 h-4 mr-2" />
                    写日记
                  </Button>
                </Link>
                <Link href="/timeline">
                  <Button variant="ghost" size="sm" className="text-orange-100 hover:text-orange-200 hover:bg-orange-800/50">
                    <Clock className="w-4 h-4 mr-2" />
                    时间线
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-orange-200" />
                  <span className="text-sm text-orange-200">
                    {userProfile?.username || user.email}
                  </span>
                </div>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-orange-100 hover:text-orange-200 hover:bg-orange-800/50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出
                </Button>
              </>
            ) : !isLoading ? (
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