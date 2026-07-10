'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
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
  action?: string
}

export function AuthGateModal({ open, onClose, action = 'do this' }: AuthGateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-md border border-zinc-200 bg-white p-8 text-center [&>button]:hidden">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border-2 border-blue-500">
          <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 11h14l1 9H4l1-9z" />
          </svg>
        </div>

        <DialogHeader className="mt-4 space-y-1">
          <DialogTitle className="text-base font-bold text-zinc-900">
            Sign in required
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-900">
            You need an account to {action}. It only takes a minute.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/register"
            onClick={onClose}
            className="flex items-center justify-center rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors duration-200"
          >
            Create account
          </Link>
          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center justify-center rounded-lg border-2 border-blue-500 px-5 py-2.5 text-sm font-semibold text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-200"
          >
            Sign in
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
