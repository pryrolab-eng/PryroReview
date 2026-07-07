'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

export type AuthModalMode = 'login' | 'register' | 'forgot'

interface AuthModalContextValue {
  isOpen: boolean
  initialMode: AuthModalMode
  openAuthModal: (action?: string, mode?: AuthModalMode) => void
  closeAuthModal: () => void
  action: string
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [action, setAction] = useState('continue')
  const [initialMode, setInitialMode] = useState<AuthModalMode>('login')

  const openAuthModal = useCallback((action = 'continue', mode: AuthModalMode = 'login') => {
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
