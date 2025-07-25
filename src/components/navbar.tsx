'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { PenTool, Clock, User, LogOut, Menu, X } from 'lucide-react'

export function Navbar() {
  const { user, isLoading, logout, userProfile } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-gradient-to-r from-orange-900/90 to-red-900/90 backdrop-blur-sm border-b border-orange-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <div className="text-2xl">🚀</div>
              <span className="text-xl font-bold text-orange-100">火星日记</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="text-orange-100 hover:text-orange-200 hover:bg-orange-800/50"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-orange-900/50 backdrop-blur-sm rounded-lg mt-2">
              {!isLoading && user ? (
                <>
                  <Link href="/write" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-orange-100 hover:text-orange-200 hover:bg-orange-800/50">
                      <PenTool className="w-4 h-4 mr-2" />
                      写日记
                    </Button>
                  </Link>
                  <Link href="/timeline" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-orange-100 hover:text-orange-200 hover:bg-orange-800/50">
                      <Clock className="w-4 h-4 mr-2" />
                      时间线
                    </Button>
                  </Link>
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <User className="w-4 h-4 text-orange-200" />
                    <span className="text-sm text-orange-200">
                      {userProfile?.username || user.email}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      logout()
                      closeMobileMenu()
                    }}
                    variant="ghost"
                    className="w-full justify-start text-orange-100 hover:text-orange-200 hover:bg-orange-800/50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    退出
                  </Button>
                </>
              ) : !isLoading ? (
                <Link href="/auth/signin" onClick={closeMobileMenu}>
                  <Button className="w-full">
                    登录
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}