'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface AuthModalContextValue {
  isOpen: boolean
  openAuthModal: (action?: string) => void
  closeAuthModal: () => void
  action: string
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [action, setAction] = useState('continue')

  const openAuthModal = useCallback((action = 'continue') => {
    setAction(action)
    setIsOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <AuthModalContext.Provider value={{ isOpen, openAuthModal, closeAuthModal, action }}>
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  if (!ctx) throw new Error('useAuthModal must be used inside AuthModalProvider')
  return ctx
}
