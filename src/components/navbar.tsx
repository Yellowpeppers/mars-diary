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
    <nav className="bg-white/5 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
                <div className="w-6 h-6 text-[#E85C35]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <span className="text-xl font-bold text-white" style={{fontFamily: 'Orbitron, sans-serif'}}>MarsMe</span>
              </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoading && user ? (
              <>
                <Link href="/write">
                  <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10">
                    <PenTool className="w-4 h-4 mr-2" />
                    写日记
                  </Button>
                </Link>
                <Link href="/timeline">
                  <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10">
                    <Clock className="w-4 h-4 mr-2" />
                    时间线
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-white/80" />
                  <span className="text-sm text-white/80">
                    {userProfile?.username || user.email}
                  </span>
                </div>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-white/90 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出
                </Button>
              </>
            ) : !isLoading ? (
              <Link href="/auth/signin">
                <Button size="sm" className="bg-orange-200/20 backdrop-blur-md border border-orange-200/30 hover:bg-orange-200/30 hover:border-orange-200/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-white hover:text-white shadow-lg hover:shadow-xl">
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
              className="text-white/90 hover:text-white hover:bg-white/10"
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
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg mt-2">
              {!isLoading && user ? (
                <>
                  <Link href="/write" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10">
                      <PenTool className="w-4 h-4 mr-2" />
                      写日记
                    </Button>
                  </Link>
                  <Link href="/timeline" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10">
                      <Clock className="w-4 h-4 mr-2" />
                      时间线
                    </Button>
                  </Link>
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <User className="w-4 h-4 text-white/80" />
                    <span className="text-sm text-white/80">
                      {userProfile?.username || user.email}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      logout()
                      closeMobileMenu()
                    }}
                    variant="ghost"
                    className="w-full justify-start text-white/90 hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    退出
                  </Button>
                </>
              ) : !isLoading ? (
                <Link href="/auth/signin" onClick={closeMobileMenu}>
                  <Button className="w-full bg-orange-200/20 backdrop-blur-md border border-orange-200/30 hover:bg-orange-200/30 hover:border-orange-200/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-white hover:text-white shadow-lg hover:shadow-xl">
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