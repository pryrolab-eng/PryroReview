'use client'

import { createContext, useContext, useState } from 'react'
import { AddCompanyModal } from '@/components/shared/add-company-modal'

interface AddCompanyModalContextType {
  openAddCompanyModal: (prefillName?: string) => void
}

const AddCompanyModalContext = createContext<AddCompanyModalContextType>({
  openAddCompanyModal: () => {},
})

export function useAddCompanyModal() {
  return useContext(AddCompanyModalContext)
}

export function AddCompanyModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [prefillName, setPrefillName] = useState('')

  const openAddCompanyModal = (name = '') => {
    setPrefillName(name)
    setOpen(true)
  }

  return (
    <AddCompanyModalContext.Provider value={{ openAddCompanyModal }}>
      {children}
      <AddCompanyModal
        open={open}
        onClose={() => setOpen(false)}
        prefillName={prefillName}
      />
    </AddCompanyModalContext.Provider>
  )
}
