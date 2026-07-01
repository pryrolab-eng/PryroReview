'use client'

import { useAuth } from '@/lib/auth-context'
import { useAuthModal } from '@/lib/auth-modal-context'
import { useCallback } from 'react'

/**
 * Returns a function that runs `action` only if the user is authenticated.
 * If not, opens the global auth modal instead.
 *
 * @param action - callback to run when authenticated
 * @param description - human-readable description shown in the modal, e.g. "write a review"
 */
export function useRequireAuth(action: () => void, description = 'continue') {
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal()

  return useCallback(() => {
    if (user) {
      action()
    } else {
      openAuthModal(description)
    }
  }, [user, action, openAuthModal, description])
}
