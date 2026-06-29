'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const categories = [
  'Telecommunications',
  'Banking & Finance',
  'Healthcare',
  'Government Services',
  'Airlines & Transport',
  'Hospitality & Tourism',
  'Retail & Shopping',
  'Education',
  'Energy & Utilities',
  'NGOs & Development',
  'Other',
]

const districts = [
  'Kigali',
  'Northern Province',
  'Southern Province',
  'Eastern Province',
  'Western Province',
]

function AddCompanyForm() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pre-fill from search bar URL params
  const prefillName = searchParams.get('name') || ''
  const prefillCategory = searchParams.get('category') || 'Other'
  const prefillDistrict = searchParams.get('district') || 'Kigali'
  const prefillWebsite = searchParams.get('website') || ''

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/add-company')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const payload = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      district: formData.get('district') as string,
      website: formData.get('website') as string,
      phone: formData.get('phone') as string,
      description: formData.get('description') as string,
    }

    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to add company')
        return
      }

      toast.success('Company added successfully')
      router.push(`/company/${data.slug}`)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Validate that prefillCategory is a valid option
  const defaultCategory = categories.includes(prefillCategory) ? prefillCategory : 'Other'
  const defaultDistrict = districts.includes(prefillDistrict) ? prefillDistrict : 'Kigali'

  return (
    <div className="animate-fade-up mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-black tracking-tight text-zinc-900">
        Add a Company
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Add a new company to the Pryro Review directory. Others can review it once it&apos;s listed.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-zinc-900">
            Company Name
          </label>
          <input
            name="name"
            type="text"
            required
            defaultValue={prefillName}
            className="mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 text-base text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none"
            placeholder="e.g. Irembo"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-zinc-900">
              Category
            </label>
            <select
              name="category"
              required
              defaultValue={defaultCategory}
              className="mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 text-base text-zinc-900 transition-colors focus:border-zinc-900 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-900">
              District
            </label>
            <select
              name="district"
              required
              defaultValue={defaultDistrict}
              className="mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 text-base text-zinc-900 transition-colors focus:border-zinc-900 focus:outline-none"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-900">
            Website (optional)
          </label>
          <input
            name="website"
            type="url"
            defaultValue={prefillWebsite}
            className="mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 text-base text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-900">
            Phone (optional)
          </label>
          <input
            name="phone"
            type="tel"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 text-base text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none"
            placeholder="e.g. 078 123 4567"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-900">
            Description (optional)
          </label>
          <textarea
            name="description"
            rows={4}
            className="mt-2 w-full rounded-xl border border-zinc-200 p-4 text-base text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none"
            placeholder="What does this company do?"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Company'
          )}
        </Button>
      </form>
    </div>
  )
}

export default function AddCompanyPage() {
  return (
    <Suspense>
      <AddCompanyForm />
    </Suspense>
  )
}
