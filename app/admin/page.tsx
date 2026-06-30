'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Building2,
  Star,
  Users,
  CreditCard,
  Flag as FlagIcon,
  Search,
  Trash2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Download,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { StarRating } from '@/components/shared/star-rating'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

type Tab = 'companies' | 'reviews' | 'users' | 'payments' | 'flags'

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'flags', label: 'Flags', icon: FlagIcon },
]

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const [tab, setTab] = useState<Tab>('companies')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  // Use refs to avoid stale closures without adding user to deps
  const tabRef = useRef(tab)
  const pageRef = useRef(page)
  tabRef.current = tab
  pageRef.current = page

  const loadData = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true)
    try {
      const res = await fetch(`/api/admin/data?tab=${tabRef.current}&page=${pageRef.current}`)
      if (res.ok) {
        const result = await res.json()
        setData(result.data)
        setTotalPages(result.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }, []) // no deps — uses refs

  // Only run once when auth resolves
  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      loadData()
    }
  }, [authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when tab or page changes
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadData()
    }
  }, [tab, page]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPage(1)
    setSearch('')
  }, [tab])

  const filtered = data.filter((item) => {
    if (!search) return true
    return JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  })

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="h-7 w-32 animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-6 flex gap-2">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />)}
        </div>
        <div className="mt-6 space-y-2">
          {[1,2,3,4,5].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    if (typeof window !== 'undefined') window.location.href = '/'
    return null
  }

  const handleDelete = async (endpoint: string, id: string) => {
    const res = await fetch(`/api/admin/${endpoint}/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Deleted successfully')
      setDeleteConfirm(null)
      loadData(false)
    } else {
      toast.error('Failed to delete')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) {
      toast.success('Role updated')
      loadData(false)
    } else {
      toast.error('Failed to update role')
    }
  }

  const handleFlagAction = async (flagId: string, dismissed: boolean) => {
    const res = await fetch(`/api/admin/flags/${flagId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dismissed }),
    })
    if (res.ok) {
      toast.success(dismissed ? 'Flag dismissed' : 'Flag actioned')
      loadData(false)
    } else {
      toast.error('Failed to update flag')
    }
  }

  const handleVerifyCompany = async (companyId: string, verified: boolean) => {
    const res = await fetch(`/api/admin/companies/${companyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified }),
    })
    if (res.ok) {
      toast.success(verified ? 'Company verified' : 'Verification removed')
      loadData(false)
    } else {
      toast.error('Failed to update company')
    }
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      const res = await fetch('/api/admin/import-businesses', { method: 'POST' })
      const result = await res.json()
      if (res.ok) {
        toast.success(`Imported ${result.imported}, skipped ${result.skipped}, errors ${result.errors}`)
        if (tab === 'companies') loadData(false)
      } else {
        toast.error(result.error || 'Import failed')
      }
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="animate-fade-up mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
        <button onClick={handleImport} disabled={importing}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-600 disabled:opacity-50">
          <Download className="h-4 w-4" />
          {importing ? 'Importing...' : 'Import Businesses'}
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              tab === t.id ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600'
            )}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mt-5">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
          className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="mt-5 space-y-2">
          {[1,2,3,4,5].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-5 rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-sm text-slate-400">No data found.</p>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[600px]">
            {tab === 'companies' && (
              <CompaniesTable
                data={filtered}
                deleteConfirm={deleteConfirm}
                setDeleteConfirm={setDeleteConfirm}
                onDelete={(id) => handleDelete('companies', id)}
                onVerify={handleVerifyCompany}
              />
            )}
            {tab === 'reviews' && (
              <ReviewsTable
                data={filtered}
                deleteConfirm={deleteConfirm}
                setDeleteConfirm={setDeleteConfirm}
                onDelete={(id) => handleDelete('reviews', id)}
              />
            )}
            {tab === 'users' && (
              <UsersTable
                data={filtered}
                onRoleChange={handleRoleChange}
                currentUserId={user.id}
              />
            )}
            {tab === 'payments' && <PaymentsTable data={filtered} />}
            {tab === 'flags' && (
              <FlagsTable
                data={filtered}
                onAction={handleFlagAction}
                onDelete={(id) => handleDelete('flags', id)}
              />
            )}
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed">
            Previous
          </button>
          <span className="px-2 text-sm text-slate-500">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function CompaniesTable({ data, deleteConfirm, setDeleteConfirm, onDelete, onVerify }: {
  data: any[]; deleteConfirm: string | null; setDeleteConfirm: (id: string | null) => void
  onDelete: (id: string) => void; onVerify: (id: string, verified: boolean) => void
}) {
  return (
    <>
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50">
          {['Name','Category','District','Verified','Actions'].map((h, i) => (
            <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((c: any) => (
          <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <td className="px-4 py-3">
              <Link href={`/company/${c.slug}`} className="text-sm font-medium text-slate-900 hover:text-blue-600">{c.name}</Link>
            </td>
            <td className="px-4 py-3 text-sm text-slate-500">{c.category}</td>
            <td className="px-4 py-3 text-sm text-slate-500">{c.district}</td>
            <td className="px-4 py-3">
              <button onClick={() => onVerify(c.id, !c.verified)}
                className={cn('inline-block rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  c.verified ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                {c.verified ? 'Verified' : 'Unverified'}
              </button>
            </td>
            <td className="px-4 py-3 text-right">
              {deleteConfirm === c.id ? (
                <div className="flex justify-end gap-2">
                  <button onClick={() => onDelete(c.id)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">Confirm</button>
                  <button onClick={() => setDeleteConfirm(null)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(c.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  )
}

function ReviewsTable({ data, deleteConfirm, setDeleteConfirm, onDelete }: {
  data: any[]; deleteConfirm: string | null; setDeleteConfirm: (id: string | null) => void; onDelete: (id: string) => void
}) {
  return (
    <>
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50">
          {['Company','User','Rating','Comment','Actions'].map((h, i) => (
            <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((r: any) => (
          <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <td className="px-4 py-3">
              <Link href={`/company/${r.company?.slug}`} className="text-sm font-medium text-slate-900 hover:text-blue-600">{r.company?.name}</Link>
            </td>
            <td className="px-4 py-3 text-sm text-slate-500">{r.user?.fullName}</td>
            <td className="px-4 py-3"><StarRating rating={r.rating} size="sm" /></td>
            <td className="px-4 py-3 max-w-xs"><p className="truncate text-sm text-slate-600">{r.comment}</p></td>
            <td className="px-4 py-3 text-right">
              {deleteConfirm === r.id ? (
                <div className="flex justify-end gap-2">
                  <button onClick={() => onDelete(r.id)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">Confirm</button>
                  <button onClick={() => setDeleteConfirm(null)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(r.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  )
}

function UsersTable({ data, onRoleChange, currentUserId }: {
  data: any[]; onRoleChange: (id: string, role: string) => void; currentUserId: string
}) {
  return (
    <>
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50">
          {['Name','Email','Role','Actions'].map((h, i) => (
            <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((u: any) => (
          <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <td className="px-4 py-3 text-sm font-medium text-slate-900">{u.fullName || '—'}</td>
            <td className="px-4 py-3 text-sm text-slate-500">{u.email}</td>
            <td className="px-4 py-3">
              <span className={cn('inline-block rounded-md px-2.5 py-1 text-xs font-medium',
                u.role === 'ADMIN' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600')}>
                {u.role}
              </span>
            </td>
            <td className="px-4 py-3 text-right">
              {u.id !== currentUserId && (
                <button onClick={() => onRoleChange(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                  className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600">
                  {u.role === 'ADMIN' ? <><ArrowDown className="h-3 w-3" /> Demote</> : <><ArrowUp className="h-3 w-3" /> Promote</>}
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  )
}

function PaymentsTable({ data }: { data: any[] }) {
  return (
    <>
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50">
          {['Method','Phone','Amount','Status','Date'].map((h) => (
            <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((p: any) => (
          <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <td className="px-4 py-3 text-sm font-medium text-slate-900">{p.method}</td>
            <td className="px-4 py-3 text-sm text-slate-500">{p.phoneNumber}</td>
            <td className="px-4 py-3 text-sm text-slate-500">{p.amount} RWF</td>
            <td className="px-4 py-3">
              <span className={cn('inline-block rounded-md px-2.5 py-1 text-xs font-medium',
                p.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                p.status === 'pending'   ? 'bg-slate-100 text-slate-600' :
                'bg-red-50 text-red-600')}>
                {p.status}
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-slate-500">
              {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  )
}

function FlagsTable({ data, onAction, onDelete }: {
  data: any[]; onAction: (id: string, dismissed: boolean) => void; onDelete: (id: string) => void
}) {
  return (
    <>
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50">
          {['Review','Company','Reason','Status','Actions'].map((h, i) => (
            <th key={h} className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((f: any) => (
          <tr key={f.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <td className="px-4 py-3 max-w-xs"><p className="truncate text-sm text-slate-600">{f.review?.comment}</p></td>
            <td className="px-4 py-3 text-sm text-slate-500">{f.review?.company?.name}</td>
            <td className="px-4 py-3 text-sm text-slate-500">{f.reason}</td>
            <td className="px-4 py-3">
              <span className={cn('inline-block rounded-md px-2.5 py-1 text-xs font-medium',
                !f.dismissed ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-400')}>
                {f.dismissed ? 'Dismissed' : 'Pending'}
              </span>
            </td>
            <td className="px-4 py-3 text-right">
              {!f.dismissed && (
                <div className="flex justify-end gap-3">
                  <button onClick={() => onAction(f.id, true)} className="text-sm text-slate-500 hover:text-slate-900">Dismiss</button>
                  <button onClick={() => onDelete(f.id)} className="text-sm text-red-500 hover:text-red-600">Delete</button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  )
}
