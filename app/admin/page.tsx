'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, Star, Users, CreditCard, Flag as FlagIcon,
  Search, Trash2, ArrowUp, ArrowDown, Download,
  ChevronLeft, ChevronRight, LayoutDashboard, LogOut,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { StarRating } from '@/components/shared/star-rating'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

type Tab = 'companies' | 'reviews' | 'users' | 'payments' | 'flags'

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'reviews',   label: 'Reviews',   icon: Star },
  { id: 'users',     label: 'Users',     icon: Users },
  { id: 'payments',  label: 'Payments',  icon: CreditCard },
  { id: 'flags',     label: 'Flags',     icon: FlagIcon },
]

export default function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('companies')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [stats, setStats] = useState({ companies: 0, reviews: 0, users: 0, payments: 0 })

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
        setTotal(result.total)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Load stats once
  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      Promise.all([
        fetch('/api/admin/data?tab=companies&page=1').then(r => r.json()),
        fetch('/api/admin/data?tab=reviews&page=1').then(r => r.json()),
        fetch('/api/admin/data?tab=users&page=1').then(r => r.json()),
        fetch('/api/admin/data?tab=payments&page=1').then(r => r.json()),
      ]).then(([c, r, u, p]) => {
        setStats({ companies: c.total, reviews: r.total, users: u.total, payments: p.total })
      }).catch(() => {})
      loadData()
    }
  }, [authLoading]) // eslint-disable-line

  useEffect(() => {
    if (user?.role === 'ADMIN') loadData()
  }, [tab, page]) // eslint-disable-line

  useEffect(() => { setPage(1); setSearch('') }, [tab])

  const filtered = data.filter((item) =>
    !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  )

  if (authLoading) {
    return (
      <div className="flex min-h-screen">
        <div className="w-16 bg-blue-600" />
        <div className="flex-1 p-8 space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-100" />)}
        </div>
      </div>
    )
  }

  if (!user) { router.replace('/login'); return null }
  if (user.role !== 'ADMIN') { router.replace('/'); return null }

  const handleDelete = async (endpoint: string, id: string) => {
    const res = await fetch(`/api/admin/${endpoint}/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); setDeleteConfirm(null); loadData(false) }
    else toast.error('Failed to delete')
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) { toast.success('Role updated'); loadData(false) }
    else toast.error('Failed to update role')
  }

  const handleFlagAction = async (flagId: string, dismissed: boolean) => {
    const res = await fetch(`/api/admin/flags/${flagId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dismissed }),
    })
    if (res.ok) { toast.success(dismissed ? 'Dismissed' : 'Actioned'); loadData(false) }
    else toast.error('Failed to update flag')
  }

  const handleVerifyCompany = async (companyId: string, verified: boolean) => {
    const res = await fetch(`/api/admin/companies/${companyId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified }),
    })
    if (res.ok) { toast.success(verified ? 'Verified' : 'Unverified'); loadData(false) }
    else toast.error('Failed to update')
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      const res = await fetch('/api/admin/import-businesses', { method: 'POST' })
      const result = await res.json()
      if (res.ok) {
        toast.success(`Imported ${result.imported}, skipped ${result.skipped}`)
        if (tab === 'companies') loadData(false)
      } else toast.error(result.error || 'Import failed')
    } finally { setImporting(false) }
  }

  const statCards = [
    { label: 'Companies', value: stats.companies, icon: Building2, color: 'bg-blue-500 text-white' },
    { label: 'Reviews',   value: stats.reviews,   icon: Star,      color: 'bg-blue-500 text-white' },
    { label: 'Users',     value: stats.users,     icon: Users,     color: 'bg-blue-500 text-white' },
    { label: 'Payments',  value: stats.payments,  icon: CreditCard,color: 'bg-blue-500 text-white' },
  ]

  return (
    <div className="flex min-h-screen bg-zinc-50">

      {/* ── Blue Sidebar — desktop only ── */}
      <aside className="hidden lg:flex w-16 flex-col items-center bg-blue-600 py-6 gap-6 sticky top-0 h-screen">
        <div className="mt-4 flex flex-col gap-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              title={t.label}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                tab === t.id ? 'bg-white text-blue-600' : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <t.icon className="h-5 w-5" />
            </button>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <button onClick={() => { signOut() }} title="Logout"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 p-4 pb-20 lg:p-8 lg:pb-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-zinc-900">Admin Panel</h1>
            <p className="text-xs text-zinc-400 mt-0.5 capitalize">{tab}</p>
          </div>
          <button onClick={() => signOut()}
            className="lg:hidden flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-zinc-700">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
          {statCards.map((s) => (
            <button
              key={s.label}
              onClick={() => setTab(s.label.toLowerCase() as Tab)}
              className="rounded-2xl bg-white p-3 lg:p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-shadow"
            >
              <div className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-xl', s.color)}>
                <s.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-zinc-900">{s.value.toLocaleString()}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Mobile tab bar */}
        <div className="lg:hidden flex flex-wrap gap-1.5 mb-4">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium',
                tab === t.id ? 'bg-blue-500 text-white' : 'border border-gray-200 text-zinc-500 hover:border-zinc-400')}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Table header label */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{tab}</span>
            <span className="text-xs text-zinc-400">{total} total</span>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-zinc-50" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-sm text-zinc-400">No data found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                {tab === 'companies' && (
                  <CompaniesTable data={filtered} deleteConfirm={deleteConfirm}
                    setDeleteConfirm={setDeleteConfirm}
                    onDelete={(id) => handleDelete('companies', id)}
                    onVerify={handleVerifyCompany} />
                )}
                {tab === 'reviews' && (
                  <ReviewsTable data={filtered} deleteConfirm={deleteConfirm}
                    setDeleteConfirm={setDeleteConfirm}
                    onDelete={(id) => handleDelete('reviews', id)} />
                )}
                {tab === 'users' && (
                  <UsersTable data={filtered} onRoleChange={handleRoleChange} currentUserId={user.id} />
                )}
                {tab === 'payments' && <PaymentsTable data={filtered} />}
                {tab === 'flags' && (
                  <FlagsTable data={filtered} onAction={handleFlagAction}
                    onDelete={(id) => handleDelete('flags', id)} />
                )}
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end px-5 py-3 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-blue-600 px-2 py-2 safe-area-pb">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
              tab === t.id ? 'bg-white/20 text-white' : 'text-white/60'
            )}
          >
            <t.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

// ── Table Components ──────────────────────────────────────────────────────────

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={cn('px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400', right ? 'text-right' : 'text-left')}>
      {children}
    </th>
  )
}

function CompaniesTable({ data, deleteConfirm, setDeleteConfirm, onDelete, onVerify }: {
  data: any[]; deleteConfirm: string | null; setDeleteConfirm: (id: string | null) => void
  onDelete: (id: string) => void; onVerify: (id: string, verified: boolean) => void
}) {
  return (
    <>
      <thead className="bg-zinc-50 border-b border-gray-100">
        <tr><Th>Name</Th><Th>Category</Th><Th>District</Th><Th>Verified</Th><Th right>Actions</Th></tr>
      </thead>
      <tbody>
        {data.map((c: any) => (
          <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-zinc-50 transition-colors">
            <td className="px-5 py-3.5">
              <Link href={`/company/${c.slug}`} className="text-sm font-medium text-zinc-900 hover:text-blue-600">{c.name}</Link>
            </td>
            <td className="px-5 py-3.5 text-sm text-zinc-500">{c.category}</td>
            <td className="px-5 py-3.5 text-sm text-zinc-500">{c.district}</td>
            <td className="px-5 py-3.5">
              <button onClick={() => onVerify(c.id, !c.verified)}
                className={cn('rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
                  c.verified ? 'bg-blue-500 text-white hover:bg-blue-600' : 'border border-zinc-200 text-zinc-500 hover:border-zinc-400')}>
                {c.verified ? 'Verified' : 'Unverified'}
              </button>
            </td>
            <td className="px-5 py-3.5 text-right">
              {deleteConfirm === c.id ? (
                <div className="flex justify-end gap-2">
                  <button onClick={() => onDelete(c.id)} className="rounded-lg bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600">Confirm</button>
                  <button onClick={() => setDeleteConfirm(null)} className="rounded-lg border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:border-zinc-400">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(c.id)} className="text-zinc-300 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
      <thead className="bg-zinc-50 border-b border-gray-100">
        <tr><Th>Company</Th><Th>User</Th><Th>Rating</Th><Th>Comment</Th><Th right>Actions</Th></tr>
      </thead>
      <tbody>
        {data.map((r: any) => (
          <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-zinc-50 transition-colors">
            <td className="px-5 py-3.5">
              <Link href={`/company/${r.company?.slug}`} className="text-sm font-medium text-zinc-900 hover:text-blue-600">{r.company?.name}</Link>
            </td>
            <td className="px-5 py-3.5 text-sm text-zinc-500">{r.user?.fullName}</td>
            <td className="px-5 py-3.5"><StarRating rating={r.rating} size="sm" /></td>
            <td className="px-5 py-3.5 max-w-xs"><p className="truncate text-sm text-zinc-600">{r.comment}</p></td>
            <td className="px-5 py-3.5 text-right">
              {deleteConfirm === r.id ? (
                <div className="flex justify-end gap-2">
                  <button onClick={() => onDelete(r.id)} className="rounded-lg bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600">Confirm</button>
                  <button onClick={() => setDeleteConfirm(null)} className="rounded-lg border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:border-zinc-400">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(r.id)} className="text-zinc-300 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
      <thead className="bg-zinc-50 border-b border-gray-100">
        <tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th right>Actions</Th></tr>
      </thead>
      <tbody>
        {data.map((u: any) => (
          <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-zinc-50 transition-colors">
            <td className="px-5 py-3.5 text-sm font-medium text-zinc-900">{u.fullName}</td>
            <td className="px-5 py-3.5 text-sm text-zinc-500">{u.email}</td>
            <td className="px-5 py-3.5">
              <span className={cn('rounded-lg px-2.5 py-1 text-xs font-semibold',
                u.role === 'ADMIN' ? 'bg-blue-500 text-white' : 'border border-zinc-200 text-zinc-500')}>
                {u.role}
              </span>
            </td>
            <td className="px-5 py-3.5 text-right">
              {u.id !== currentUserId && (
                <button onClick={() => onRoleChange(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                  className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-900 transition-colors">
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
      <thead className="bg-zinc-50 border-b border-gray-100">
        <tr><Th>Method</Th><Th>Phone</Th><Th>Amount</Th><Th>Status</Th><Th>Date</Th></tr>
      </thead>
      <tbody>
        {data.map((p: any) => (
          <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-zinc-50 transition-colors">
            <td className="px-5 py-3.5 text-sm font-medium text-zinc-900">{p.method}</td>
            <td className="px-5 py-3.5 text-sm text-zinc-500">{p.phoneNumber}</td>
            <td className="px-5 py-3.5 text-sm text-zinc-500">{p.amount} RWF</td>
            <td className="px-5 py-3.5">
              <span className={cn('rounded-lg px-2.5 py-1 text-xs font-semibold',
                p.status === 'confirmed' ? 'bg-blue-500 text-white' :
                p.status === 'pending'   ? 'border border-zinc-200 text-zinc-500' :
                'bg-red-100 text-red-600')}>
                {p.status}
              </span>
            </td>
            <td className="px-5 py-3.5 text-sm text-zinc-500">
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
      <thead className="bg-zinc-50 border-b border-gray-100">
        <tr><Th>Review</Th><Th>Company</Th><Th>Reason</Th><Th>Status</Th><Th right>Actions</Th></tr>
      </thead>
      <tbody>
        {data.map((f: any) => (
          <tr key={f.id} className="border-b border-gray-50 last:border-0 hover:bg-zinc-50 transition-colors">
            <td className="px-5 py-3.5 max-w-xs"><p className="truncate text-sm text-zinc-600">{f.review?.comment}</p></td>
            <td className="px-5 py-3.5 text-sm text-zinc-500">{f.review?.company?.name}</td>
            <td className="px-5 py-3.5 text-sm text-zinc-500">{f.reason}</td>
            <td className="px-5 py-3.5">
              <span className={cn('rounded-lg px-2.5 py-1 text-xs font-medium',
                !f.dismissed ? 'bg-amber-50 text-amber-600' : 'bg-zinc-100 text-zinc-500')}>
                {f.dismissed ? 'Dismissed' : 'Pending'}
              </span>
            </td>
            <td className="px-5 py-3.5 text-right">
              {!f.dismissed && (
                <div className="flex justify-end gap-3">
                  <button onClick={() => onAction(f.id, true)} className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">Dismiss</button>
                  <button onClick={() => onDelete(f.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  )
}
