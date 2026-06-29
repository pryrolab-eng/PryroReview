'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Building2,
  Star,
  Users,
  CreditCard,
  ShieldCheck,
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
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/shared/star-rating'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

type Tab = 'companies' | 'reviews' | 'users' | 'payments' | 'claims' | 'flags'

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'claims', label: 'Claims', icon: ShieldCheck },
  { id: 'flags', label: 'Flags', icon: FlagIcon },
]

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const [tab, setTab] = useState<Tab>('companies')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const loadData = useCallback(async () => {
    if (!user || user.role !== 'ADMIN') return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/data?tab=${tab}&page=${page}`)
      if (res.ok) {
        const result = await res.json()
        setData(result.data)
        setTotalPages(result.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }, [tab, page, user])

  useEffect(() => {
    if (!authLoading && user) loadData()
  }, [loadData, authLoading, user])

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
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="h-8 w-32 animate-pulse rounded bg-zinc-100" />
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  const handleDelete = async (endpoint: string, id: string) => {
    const res = await fetch(`/api/admin/${endpoint}/${id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      toast.success('Deleted successfully')
      setDeleteConfirm(null)
      loadData()
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
      loadData()
    } else {
      toast.error('Failed to update role')
    }
  }

  const handleClaimAction = async (
    claimId: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    const res = await fetch(`/api/admin/claims/${claimId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success(`Claim ${status.toLowerCase()}`)
      loadData()
    } else {
      toast.error('Failed to update claim')
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
      loadData()
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
      loadData()
    } else {
      toast.error('Failed to update company')
    }
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      const res = await fetch('/api/admin/import-businesses', {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(
          `Imported ${data.imported}, skipped ${data.skipped}, errors ${data.errors}`
        )
        if (tab === 'companies') loadData()
      } else {
        toast.error(data.error || 'Import failed')
      }
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="animate-fade-up mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tight text-zinc-900">
          Admin Panel
        </h1>
        <Button
          onClick={handleImport}
          disabled={importing}
          variant="outline"
          className="rounded-full"
        >
          <Download className="mr-2 h-4 w-4" />
          {importing ? 'Importing...' : 'Import Businesses'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
              tab === t.id
                ? 'bg-zinc-900 text-white'
                : 'border border-zinc-100 text-zinc-500 hover:text-zinc-900'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mt-6">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="h-11 w-full rounded-xl border border-zinc-200 pl-11 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-zinc-100"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-zinc-100 p-12 text-center">
          <p className="text-sm text-zinc-500">No data found.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-100">
          <table className="w-full">
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
            {tab === 'claims' && (
              <ClaimsTable data={filtered} onAction={handleClaimAction} />
            )}
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
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-zinc-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

function CompaniesTable({
  data,
  deleteConfirm,
  setDeleteConfirm,
  onDelete,
  onVerify,
}: {
  data: any[]
  deleteConfirm: string | null
  setDeleteConfirm: (id: string | null) => void
  onDelete: (id: string) => void
  onVerify: (id: string, verified: boolean) => void
}) {
  return (
    <>
      <thead>
        <tr className="border-b border-zinc-100 bg-zinc-50">
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Name</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Category</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">District</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Verified</th>
          <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((c: any) => (
          <tr key={c.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
            <td className="px-4 py-3">
              <Link href={`/company/${c.slug}`} className="text-sm font-medium text-zinc-900 hover:underline">
                {c.name}
              </Link>
            </td>
            <td className="px-4 py-3 text-sm text-zinc-500">{c.category}</td>
            <td className="px-4 py-3 text-sm text-zinc-500">{c.district}</td>
            <td className="px-4 py-3">
              <button
                onClick={() => onVerify(c.id, !c.verified)}
                className={cn(
                  'inline-block rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  c.verified
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                )}
              >
                {c.verified ? 'Verified' : 'Unverified'}
              </button>
            </td>
            <td className="px-4 py-3 text-right">
              {deleteConfirm === c.id ? (
                <div className="flex justify-end gap-2">
                  <Button size="sm" className="rounded-full bg-red-500 text-white hover:bg-red-600" onClick={() => onDelete(c.id)}>
                    Confirm
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setDeleteConfirm(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(c.id)} className="text-zinc-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  )
}

function ReviewsTable({
  data,
  deleteConfirm,
  setDeleteConfirm,
  onDelete,
}: {
  data: any[]
  deleteConfirm: string | null
  setDeleteConfirm: (id: string | null) => void
  onDelete: (id: string) => void
}) {
  return (
    <>
      <thead>
        <tr className="border-b border-zinc-100 bg-zinc-50">
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Company</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">User</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Rating</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Comment</th>
          <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((r: any) => (
          <tr key={r.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
            <td className="px-4 py-3">
              <Link href={`/company/${r.company?.slug}`} className="text-sm font-medium text-zinc-900 hover:underline">
                {r.company?.name}
              </Link>
            </td>
            <td className="px-4 py-3 text-sm text-zinc-500">{r.user?.fullName}</td>
            <td className="px-4 py-3">
              <StarRating rating={r.rating} size="sm" />
            </td>
            <td className="px-4 py-3 max-w-xs">
              <p className="truncate text-sm text-zinc-600">{r.comment}</p>
            </td>
            <td className="px-4 py-3 text-right">
              {deleteConfirm === r.id ? (
                <div className="flex justify-end gap-2">
                  <Button size="sm" className="rounded-full bg-red-500 text-white hover:bg-red-600" onClick={() => onDelete(r.id)}>
                    Confirm
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setDeleteConfirm(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(r.id)} className="text-zinc-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  )
}

function UsersTable({
  data,
  onRoleChange,
  currentUserId,
}: {
  data: any[]
  onRoleChange: (id: string, role: string) => void
  currentUserId: string
}) {
  return (
    <>
      <thead>
        <tr className="border-b border-zinc-100 bg-zinc-50">
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Name</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Email</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Role</th>
          <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((u: any) => (
          <tr key={u.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
            <td className="px-4 py-3 text-sm font-medium text-zinc-900">{u.fullName || '—'}</td>
            <td className="px-4 py-3 text-sm text-zinc-500">{u.email}</td>
            <td className="px-4 py-3">
              <span className={cn(
                'inline-block rounded-full px-3 py-1 text-xs font-medium',
                u.role === 'ADMIN' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
              )}>
                {u.role}
              </span>
            </td>
            <td className="px-4 py-3 text-right">
              {u.id !== currentUserId && (
                <button
                  onClick={() => onRoleChange(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                  className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
                >
                  {u.role === 'ADMIN' ? (
                    <><ArrowDown className="h-3 w-3" /> Demote</>
                  ) : (
                    <><ArrowUp className="h-3 w-3" /> Promote</>
                  )}
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
        <tr className="border-b border-zinc-100 bg-zinc-50">
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Method</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Phone</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Amount</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Status</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Date</th>
        </tr>
      </thead>
      <tbody>
        {data.map((p: any) => (
          <tr key={p.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
            <td className="px-4 py-3 text-sm font-medium text-zinc-900">{p.method}</td>
            <td className="px-4 py-3 text-sm text-zinc-500">{p.phoneNumber}</td>
            <td className="px-4 py-3 text-sm text-zinc-500">{p.amount} RWF</td>
            <td className="px-4 py-3">
              <span className={cn(
                'inline-block rounded-full px-3 py-1 text-xs font-medium',
                p.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                p.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              )}>
                {p.status}
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-zinc-500">
              {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  )
}

function ClaimsTable({
  data,
  onAction,
}: {
  data: any[]
  onAction: (id: string, status: 'APPROVED' | 'REJECTED') => void
}) {
  return (
    <>
      <thead>
        <tr className="border-b border-zinc-100 bg-zinc-50">
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Company</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Claimant</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Email</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Status</th>
          <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((c: any) => (
          <tr key={c.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
            <td className="px-4 py-3">
              <Link href={`/company/${c.company?.slug}`} className="text-sm font-medium text-zinc-900 hover:underline">
                {c.company?.name}
              </Link>
            </td>
            <td className="px-4 py-3 text-sm text-zinc-500">{c.fullName}</td>
            <td className="px-4 py-3 text-sm text-zinc-500">{c.businessEmail}</td>
            <td className="px-4 py-3">
              <span className={cn(
                'inline-block rounded-full px-3 py-1 text-xs font-medium',
                c.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                c.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              )}>
                {c.status}
              </span>
            </td>
            <td className="px-4 py-3 text-right">
              {c.status === 'PENDING' && (
                <div className="flex justify-end gap-2">
                  <button onClick={() => onAction(c.id, 'APPROVED')} className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
                    <Check className="h-4 w-4" /> Approve
                  </button>
                  <button onClick={() => onAction(c.id, 'REJECTED')} className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
                    <X className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  )
}

function FlagsTable({
  data,
  onAction,
  onDelete,
}: {
  data: any[]
  onAction: (id: string, dismissed: boolean) => void
  onDelete: (id: string) => void
}) {
  return (
    <>
      <thead>
        <tr className="border-b border-zinc-100 bg-zinc-50">
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Review</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Company</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Reason</th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">Status</th>
          <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((f: any) => (
          <tr key={f.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
            <td className="px-4 py-3 max-w-xs">
              <p className="truncate text-sm text-zinc-600">{f.review?.comment}</p>
            </td>
            <td className="px-4 py-3 text-sm text-zinc-500">{f.review?.company?.name}</td>
            <td className="px-4 py-3 text-sm text-zinc-500">{f.reason}</td>
            <td className="px-4 py-3">
              <span className={cn(
                'inline-block rounded-full px-3 py-1 text-xs font-medium',
                !f.dismissed ? 'bg-orange-100 text-orange-700' : 'bg-zinc-100 text-zinc-600'
              )}>
                {f.dismissed ? 'Dismissed' : 'Pending'}
              </span>
            </td>
            <td className="px-4 py-3 text-right">
              {!f.dismissed && (
                <div className="flex justify-end gap-2">
                  <button onClick={() => onAction(f.id, true)} className="text-sm text-zinc-500 hover:text-zinc-900">
                    Dismiss
                  </button>
                  <button onClick={() => onDelete(f.id)} className="text-sm text-red-500 hover:text-red-600">
                    Delete
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  )
}
