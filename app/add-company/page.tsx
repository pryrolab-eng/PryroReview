'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAddCompanyModal } from '@/lib/add-company-modal-context'

function AddCompanyRedirect() {
  const { openAddCompanyModal } = useAddCompanyModal()
  const searchParams = useSearchParams()
  const prefillName = searchParams.get('name') || ''

  useEffect(() => {
    const timer = setTimeout(() => {
      openAddCompanyModal(prefillName)
    }, 100)
    return () => clearTimeout(timer)
  }, [openAddCompanyModal, prefillName])

  return null
}

export default function AddCompanyPage() {
  return (
    <Suspense>
      <AddCompanyRedirect />
    </Suspense>
  )
}
