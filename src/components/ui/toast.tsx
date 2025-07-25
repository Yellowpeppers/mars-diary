'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  type: ToastType
  title: string
  description?: string
  duration?: number
  onClose?: () => void
  className?: string
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-gradient-to-r from-orange-600/95 to-orange-500/95',
    borderColor: 'border-orange-400/50',
    textColor: 'text-white',
    iconColor: 'text-orange-100'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-gradient-to-r from-red-600/95 to-red-500/95',
    borderColor: 'border-red-400/50',
    textColor: 'text-white',
    iconColor: 'text-red-100'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-gradient-to-r from-yellow-600/95 to-orange-500/95',
    borderColor: 'border-yellow-400/50',
    textColor: 'text-white',
    iconColor: 'text-yellow-100'
  },
  info: {
    icon: Info,
    bgColor: 'bg-gradient-to-r from-orange-700/95 to-red-600/95',
    borderColor: 'border-orange-400/50',
    textColor: 'text-white',
    iconColor: 'text-orange-100'
  }
}

export function Toast({ 
  type, 
  title, 
  description, 
  duration = 4000, 
  onClose,
  className 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)
  
  const config = toastConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300) // 动画持续时间
  }

  if (!isVisible) return null

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 max-w-sm w-full',
      'transform transition-all duration-300 ease-in-out',
      isLeaving 
        ? 'translate-x-full opacity-0 scale-95' 
        : 'translate-x-0 opacity-100 scale-100',
      className
    )}>
      <div className={cn(
        'rounded-lg border backdrop-blur-sm shadow-lg p-4',
        'flex items-start space-x-3',
        config.bgColor,
        config.borderColor
      )}>
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconColor)} />
        
        <div className="flex-1 min-w-0">
          <h4 className={cn('text-sm font-medium', config.textColor)}>
            {title}
          </h4>
          {description && (
            <p className={cn('text-xs mt-1 opacity-90', config.textColor)}>
              {description}
            </p>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className={cn(
            'flex-shrink-0 p-1 rounded-md transition-colors',
            'hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50',
            config.textColor
          )}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Toast容器组件
interface ToastContainerProps {
  toasts: Array<{
    id: string
    type: ToastType
    title: string
    description?: string
    duration?: number
  }>
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ 
            transform: `translateY(${index * 8}px)`,
            zIndex: 50 - index
          }}
        >
          <Toast
            type={toast.type}
            title={toast.title}
            description={toast.description}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    type: ToastType
    title: string
    description?: string
    duration?: number
  }>>([])

  const addToast = (toast: Omit<typeof toasts[0], 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (title: string, description?: string) => {
    addToast({ type: 'success', title, description })
  }

  const error = (title: string, description?: string) => {
    addToast({ type: 'error', title, description })
  }

  const warning = (title: string, description?: string) => {
    addToast({ type: 'warning', title, description })
  }

  const info = (title: string, description?: string) => {
    addToast({ type: 'info', title, description })
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}