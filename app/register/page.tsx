'use client'

import { useEffect } from 'react'
import { useAuthModal } from '@/lib/auth-modal-context'

export default function RegisterPage() {
  const { openAuthModal } = useAuthModal()

  useEffect(() => {
    const timer = setTimeout(() => {
      openAuthModal('sign up', 'register')
    }, 100)
    return () => clearTimeout(timer)
  }, [openAuthModal])

  return null
}
