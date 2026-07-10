'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useAuthModal } from '@/lib/auth-modal-context'
import { toast } from 'sonner'

const categories = ['Telecommunications','Banking & Finance','Healthcare','Government Services','Airlines & Transport','Hospitality & Tourism','Retail & Shopping','Education','Energy & Utilities','NGOs & Development','Other']
const districts  = ['Kigali','Northern Province','Southern Province','Eastern Province','Western Province']

const inputCls  = 'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'
const selectCls = 'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200'
const labelCls  = 'block text-xs font-medium text-zinc-700 mb-1'

interface AddCompanyModalProps {
  open: boolean
  onClose: () => void
  prefillName?: string
}

export function AddCompanyModal({ open, onClose, prefillName = '' }: AddCompanyModalProps) {
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState(prefillName)
  const [category, setCategory] = useState('Other')
  const [district, setDistrict] = useState('Kigali')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      onClose()
      openAuthModal('add a company')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, district, website, phone, description }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to add company'); return }
      toast.success('Company added!')
      onClose()
      router.push(`/company/${data.slug}`)
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
      <div className="absolute inset-0 bg-black/30 pointer-events-auto" onClick={onClose} />
      <div className="relative w-full max-w-xs rounded-[2rem] bg-white shadow-2xl overflow-hidden pointer-events-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Add a Company</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Add it to the directory</p>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-gray-100 hover:text-zinc-700 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3 max-h-[70vh] overflow-y-auto">

          <div>
            <label className={labelCls}>Company Name *</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Irembo" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>District</label>
              <select value={district} onChange={(e) => setDistrict(e.target.value)} className={selectCls}>
                {districts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Website <span className="text-zinc-400 font-normal">(optional)</span></label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Phone <span className="text-zinc-400 font-normal">(optional)</span></label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="078 123 4567" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Description <span className="text-zinc-400 font-normal">(optional)</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this company do?" rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-200" />
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full h-8 rounded-lg bg-blue-500 text-sm font-semibold text-white hover:bg-blue-600 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</> : 'Add Company'}
          </button>

        </form>
      </div>
    </div>
  )
}
