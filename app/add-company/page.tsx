'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useAuthModal } from '@/lib/auth-modal-context'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const categories = ['Telecommunications','Banking & Finance','Healthcare','Government Services','Airlines & Transport','Hospitality & Tourism','Retail & Shopping','Education','Energy & Utilities','NGOs & Development','Other']
const districts  = ['Kigali','Northern Province','Southern Province','Eastern Province','Western Province']

const inputCls  = 'h-11 w-full rounded-md border border-zinc-300 bg-white px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700'
const selectCls = 'h-11 w-full rounded-md border border-zinc-300 bg-white px-3.5 text-sm text-zinc-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700'
const labelCls  = 'block text-sm font-medium text-zinc-900 mb-1.5'

function AddCompanyForm() {
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal()
  const router = useRouter()
  const searchParams = useSearchParams()

  const prefillName     = searchParams.get('name') || ''
  const prefillCategory = searchParams.get('category') || 'Other'
  const prefillDistrict = searchParams.get('district') || 'Kigali'
  const prefillWebsite  = searchParams.get('website') || ''

  const [submitting, setSubmitting] = useState(false)

  const defaultCategory = categories.includes(prefillCategory) ? prefillCategory : 'Other'
  const defaultDistrict = districts.includes(prefillDistrict) ? prefillDistrict : 'Kigali'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { openAuthModal('add a company'); return }
    setSubmitting(true)
    const fd = new FormData(e.target as HTMLFormElement)
    const payload = {
      name: fd.get('name'), category: fd.get('category'), district: fd.get('district'),
      website: fd.get('website'), phone: fd.get('phone'), description: fd.get('description'),
    }
    try {
      const res = await fetch('/api/companies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to add company'); return }
      toast.success('Company added')
      router.push(`/company/${data.slug}`)
    } catch { toast.error('Something went wrong.') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="animate-fade-up mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-zinc-900">Add a Company</h1>
      <p className="mt-1 text-sm text-zinc-900">
        Add a business to the PryroReview directory so others can review it.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className={labelCls}>Company Name</label>
          <input name="name" type="text" required defaultValue={prefillName}
            className={inputCls} placeholder="e.g. Irembo" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Category</label>
            <select name="category" required defaultValue={defaultCategory} className={selectCls}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>District</label>
            <select name="district" required defaultValue={defaultDistrict} className={selectCls}>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Website <span className="text-zinc-900 font-normal">(optional)</span></label>
          <input name="website" type="url" defaultValue={prefillWebsite}
            className={inputCls} placeholder="https://example.com" />
        </div>

        <div>
          <label className={labelCls}>Phone <span className="text-zinc-900 font-normal">(optional)</span></label>
          <input name="phone" type="tel" className={inputCls} placeholder="078 123 4567" />
        </div>

        <div>
          <label className={labelCls}>Description <span className="text-zinc-900 font-normal">(optional)</span></label>
          <textarea name="description" rows={3}
            className="w-full rounded-md border border-zinc-300 bg-white p-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 resize-none"
            placeholder="What does this company do?" />
        </div>

        <Button type="submit" disabled={submitting} className="w-full" size="lg">
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</> : 'Add Company'}
        </Button>
      </form>
    </div>
  )
}

export default function AddCompanyPage() {
  return <Suspense><AddCompanyForm /></Suspense>
}
