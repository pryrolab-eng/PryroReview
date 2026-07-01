'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface AuthModalContextValue {
  isOpen: boolean
  initialMode: 'login' | 'register'
  openAuthModal: (action?: string, mode?: 'login' | 'register') => void
  closeAuthModal: () => void
  action: string
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [action, setAction] = useState('continue')
  const [initialMode, setInitialMode] = useState<'login' | 'register'>('login')

  const openAuthModal = useCallback((action = 'continue', mode: 'login' | 'register' = 'login') => {
    setAction(action)
    setInitialMode(mode)
    setIsOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <AuthModalContext.Provider value={{ isOpen, initialMode, openAuthModal, closeAuthModal, action }}>
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  if (!ctx) throw new Error('useAuthModal must be used inside AuthModalProvider')
  return ctx
}
