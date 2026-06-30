'use client'

import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface AuthGateModalProps {
  open: boolean
  onClose: () => void
  /** Short description of what they're trying to do, e.g. "write a review" */
  action?: string
}

export function AuthGateModal({ open, onClose, action = 'do this' }: AuthGateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl p-8 text-center">
        {/* Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
          🔒
        </div>

        <DialogHeader className="mt-4 space-y-1">
          <DialogTitle className="text-base font-bold text-slate-900">
            Sign in required
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            You need an account to {action}. It only takes a minute.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/register"
            onClick={onClose}
            className="flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Create account
          </Link>
          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
