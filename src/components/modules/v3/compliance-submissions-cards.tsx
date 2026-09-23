'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Search, X, Trash2, CheckCircle2, Clock, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'

// ==================== TYPES ====================

export type FormType = 'OHS' | 'EVM' | 'Road Safety' | 'Social' | 'Social Legacy'
export type FormStatus = 'PMC' | 'PGMC' | 'CRDA' | 'Approved' | 'Rejected' | 'Pending'

export interface FormEntry {
  id: string
  formType: FormType
  submittedBy: string
  location: string
  date: string
  status: FormStatus
  remarks?: string
}

export const FORM_TYPES: FormType[] = ['OHS', 'EVM', 'Road Safety', 'Social', 'Social Legacy']

export const STATUS_COLORS: Record<FormStatus, string> = {
  PMC: '#3b82f6',
  PGMC: '#f59e0b',
  CRDA: '#8b5cf6',
  Approved: '#10b981',
  Rejected: '#ef4444',
  Pending: '#f97316',
}

export const STATUS_OPTIONS: FormStatus[] = ['PMC', 'PGMC', 'CRDA', 'Approved', 'Rejected', 'Pending']

export const STORAGE_KEY = 'es-forms-data-v2'

// Seed data that strictly aligns with executive reporting
export function seedData(): FormEntry[] {
  const forms: FormEntry[] = []
  const names = ['Ravi Kumar', 'Sita Devi', 'Arjun Rao', 'Priya Reddy', 'Suresh Babu', 'Meena Sharma']
  const locations = [
    'Seed Access Road',
    'Capital Building (CBD)',
    'Government Complex',
    'High Court Complex',
    'Legislative Assembly',
    'Secretariat Building',
    'Amaravati Riverfront',
    'CRDA Township Phase 1',
    'PMGSY Roads Package',
    'Town & Country Planning',
  ]

  // Distribution matching dashboard reports:
  // OHS (14): PMC: 1, PGMC: 5, CRDA: 4, Approved: 2, Rejected: 2, Pending: 0
  // EVM (12): PMC: 1, PGMC: 5, CRDA: 1, Approved: 3, Rejected: 2, Pending: 0
  // Road Safety (10): PMC: 2, PGMC: 1, CRDA: 2, Approved: 2, Rejected: 3, Pending: 0
  // Social (16): PGMC: 2, CRDA: 2, Approved: 7, Rejected: 2, Pending: 3
  // Social Legacy (8): PMC: 1, PGMC: 3, CRDA: 1, Approved: 1, Rejected: 1, Pending: 1
  const spec: Record<FormType, Record<FormStatus, number>> = {
    OHS: { PMC: 1, PGMC: 5, CRDA: 4, Approved: 2, Rejected: 2, Pending: 0 },
    EVM: { PMC: 1, PGMC: 5, CRDA: 1, Approved: 3, Rejected: 2, Pending: 0 },
    'Road Safety': { PMC: 2, PGMC: 1, CRDA: 2, Approved: 2, Rejected: 3, Pending: 0 },
    Social: { PMC: 0, PGMC: 2, CRDA: 2, Approved: 7, Rejected: 2, Pending: 3 },
    'Social Legacy': { PMC: 1, PGMC: 3, CRDA: 1, Approved: 1, Rejected: 1, Pending: 1 },
  }

  FORM_TYPES.forEach(type => {
    const counts = spec[type]
    Object.entries(counts).forEach(([statusKey, count]) => {
      const status = statusKey as FormStatus
      for (let i = 0; i < count; i++) {
        const d = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        forms.push({
          id: `${type}-${status}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          formType: type,
          submittedBy: names[Math.floor(Math.random() * names.length)],
          location: locations[Math.floor(Math.random() * locations.length)],
          date: d.toISOString().split('T')[0],
          status,
        })
      }
    })
  })

  return forms
}

export function loadForms(): FormEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    const seed = seedData()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  } catch {
    return []
  }
}

// ==================== STAT CARD ====================

interface StatCardProps {
  formType: FormType
  entries: FormEntry[]
  isSelected?: boolean
  onClick?: () => void
}

export function StatCard({ formType, entries, isSelected, onClick }: StatCardProps) {
  const total = entries.length
  const pending = entries.filter(e => e.status === 'Pending').length
  const breakdown = STATUS_OPTIONS.filter(s => s !== 'Pending').map(s => ({
    name: s,
    value: entries.filter(e => e.status === s).length,
    color: STATUS_COLORS[s],
  })).filter(d => d.value > 0)

  const chartData = breakdown.length > 0 ? breakdown : [{ name: 'None', value: 1, color: '#e2e8f0' }]

  return (
    <Card
      onClick={onClick}
      className={cn(
        'flex-1 min-w-0 border shadow-xs transition-all duration-200 cursor-pointer rounded-2xl bg-card',
        isSelected
          ? 'border-2 border-teal-500 ring-2 ring-teal-500/20 shadow-md'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
      )}
    >
      <CardContent className="p-3.5 flex flex-col gap-2.5">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate text-center">
          {formType}
        </p>
        <div className="relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                dataKey="value"
                strokeWidth={0}
                cornerRadius={5}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: '11px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  color: '#fff',
                  border: 'none',
                  padding: '4px 8px',
                }}
                formatter={(v, n) => [v, n]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">
              {total}
            </span>
            <span className="text-[9px] text-muted-foreground font-medium mt-0.5">Created</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
          {breakdown.map(b => (
            <span
              key={b.name}
              className="flex items-center gap-1 text-[9px] text-slate-600 dark:text-slate-300 font-medium"
            >
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: b.color }}
              />
              {b.name}: {b.value}
            </span>
          ))}
        </div>
        <div className="border border-orange-400/80 rounded-xl px-2.5 py-1.5 text-center bg-orange-50/70 dark:bg-orange-950/20 flex items-center justify-between mt-auto">
          <p className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">Pending</p>
          <p className="text-xl font-black text-orange-500 leading-none">{pending}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== COMPLIANCE SUBMISSIONS CARDS ROW ====================

export function ComplianceSubmissionsCards() {
  const [forms, setForms] = useState<FormEntry[]>([])
  const [selectedType, setSelectedType] = useState<FormType | null>('Social')

  useEffect(() => {
    setForms(loadForms())

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setForms(loadForms())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <div className="flex flex-col gap-2 shrink-0">
      <h2 className="text-sm font-bold text-foreground tracking-tight">
        Compliance Submissions & Reports
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 shrink-0">
        {FORM_TYPES.map(type => (
          <StatCard
            key={type}
            formType={type}
            entries={forms.filter(f => f.formType === type)}
            isSelected={selectedType === type}
            onClick={() => setSelectedType(type === selectedType ? null : type)}
          />
        ))}
      </div>
    </div>
  )
}

// ==================== RECENT SUBMISSIONS TABLE ====================

const fetchSubmissions = async (formType: string) => {
  const res = await fetch(`/api/es-forms/${formType}`)
  if (!res.ok) throw new Error('Failed to fetch')
  const json = await res.json()
  return (json.data || []).map((dbItem: any) => ({
    id: dbItem.id,
    projectName: dbItem.projectName,
    reportingMonth: dbItem.reportingMonth,
    status: dbItem.status,
    submittedAt: dbItem.submittedAt,
    ...JSON.parse(dbItem.formData || '{}')
  }))
}

export function AllSubmissionsTable() {
  const [forms, setForms] = useState<FormEntry[]>(() => loadForms())
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const queryClient = useQueryClient()

  const { data: ohsSubmissions = [] } = useQuery<any[]>({ queryKey: ['es-forms', 'OHS'], queryFn: () => fetchSubmissions('OHS') })
  const { data: rsSubmissions = [] } = useQuery<any[]>({ queryKey: ['es-forms', 'RoadSafety'], queryFn: () => fetchSubmissions('RoadSafety') })
  const { data: evmSubmissions = [] } = useQuery<any[]>({ queryKey: ['es-forms', 'EVM'], queryFn: () => fetchSubmissions('EVM') })
  const { data: ssSubmissions = [] } = useQuery<any[]>({ queryKey: ['es-forms', 'SocialSafeguard'], queryFn: () => fetchSubmissions('SocialSafeguard') })
  const { data: stSubmissions = [] } = useQuery<any[]>({ queryKey: ['es-forms', 'SkillTraining'], queryFn: () => fetchSubmissions('SkillTraining') })
  const { data: llSubmissions = [] } = useQuery<any[]>({ queryKey: ['es-forms', 'LabourLaw'], queryFn: () => fetchSubmissions('LabourLaw') })
  const { data: genSubmissions = [] } = useQuery<any[]>({ queryKey: ['es-forms', 'Gender'], queryFn: () => fetchSubmissions('Gender') })

  const deleteMutation = useMutation({
    mutationFn: async ({ formType, id }: { formType: string; id: string }) => {
      const res = await fetch(`/api/es-forms/${formType}?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['es-forms', variables.formType] })
      toast.success('Deleted')
    },
    onError: () => toast.error('Failed to delete record'),
  })

  const handleDelete = (id: string) => {
    const updated = forms.filter(f => f.id !== id)
    setForms(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    toast.success('Record deleted')
  }

  const unifiedData = useMemo(() => {
    const combined = [
      ...ohsSubmissions.map((s: any) => ({ id: s.id, formType: 'OHS', projectName: s.projectName || '—', reportingMonth: s.reportingMonth || '—', submittedAt: s.submittedAt || '', status: s.status || 'Draft', originalType: 'OHS' })),
      ...rsSubmissions.map((s: any) => ({ id: s.id, formType: 'Road Safety', projectName: s.projectName || '—', reportingMonth: s.reportingMonth || '—', submittedAt: s.submittedAt || '', status: s.status || 'Draft', originalType: 'RoadSafety' })),
      ...evmSubmissions.map((s: any) => ({ id: s.id, formType: 'EVM', projectName: s.projectName || '—', reportingMonth: s.reportingMonth || '—', submittedAt: s.submittedAt || '', status: s.status || 'Draft', originalType: 'EVM' })),
      ...ssSubmissions.map((s: any) => ({ id: s.id, formType: 'Social Safeguard', projectName: s.projectName || '—', reportingMonth: s.reportingMonth || '—', submittedAt: s.submittedAt || '', status: s.status || 'Draft', originalType: 'SocialSafeguard' })),
      ...stSubmissions.map((s: any) => ({ id: s.id, formType: 'Skill Training', projectName: s.projectName || '—', reportingMonth: s.reportingMonth || '—', submittedAt: s.submittedAt || '', status: s.status || 'Draft', originalType: 'SkillTraining' })),
      ...llSubmissions.map((s: any) => ({ id: s.id, formType: 'Labour Law', projectName: s.projectName || '—', reportingMonth: s.reportingMonth || '—', submittedAt: s.submittedAt || '', status: s.status || 'Draft', originalType: 'LabourLaw' })),
      ...genSubmissions.map((s: any) => ({ id: s.id, formType: 'Gender & GBV', projectName: s.projectName || '—', reportingMonth: s.reportingMonth || '—', submittedAt: s.submittedAt || '', status: s.status || 'Draft', originalType: 'Gender' })),
      ...forms.map(f => ({ id: f.id, formType: f.formType as string, projectName: f.location, reportingMonth: f.date, submittedAt: f.date, status: f.status as string, isMock: true })),
    ]
    return combined.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  }, [ohsSubmissions, rsSubmissions, evmSubmissions, ssSubmissions, stSubmissions, llSubmissions, genSubmissions, forms])

  const filteredUnified = useMemo(() =>
    unifiedData.filter(f => {
      if (typeFilter && typeFilter !== 'All' && f.formType !== typeFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!f.formType.toLowerCase().includes(q) && !f.projectName.toLowerCase().includes(q)) return false
      }
      return true
    }),
    [unifiedData, search, typeFilter]
  )

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredUnified.length / itemsPerPage)
  const paginatedData = filteredUnified.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const hasFilter = !!(search || typeFilter)

  return (
    <Card className="flex flex-col shrink-0 h-full">
      <div className="flex flex-row items-center gap-2 px-3 py-2.5 border-b bg-muted/20">
        <p className="text-sm font-bold text-[#0d9488] shrink-0">Recent Submissions</p>
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
            className="pl-7 h-7 text-xs w-full"
          />
        </div>
        <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setCurrentPage(1) }}>
          <SelectTrigger className="w-28 h-7 text-xs shrink-0"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="OHS">OHS</SelectItem>
            <SelectItem value="Road Safety">Road Safety</SelectItem>
            <SelectItem value="EVM">EVM</SelectItem>
            <SelectItem value="Social Safeguard">Social Safeguard</SelectItem>
            <SelectItem value="Skill Training">Skill Training</SelectItem>
            <SelectItem value="Labour Law">Labour Law</SelectItem>
            <SelectItem value="Gender & GBV">Gender & GBV</SelectItem>
          </SelectContent>
        </Select>
        {hasFilter && (
          <Button variant="outline" size="sm" className="h-7 w-7 p-0 shrink-0"
            onClick={() => { setSearch(''); setTypeFilter(''); setCurrentPage(1) }}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto overflow-y-auto max-h-[440px]">
          <Table className="w-full text-xs">
            <TableHeader className="bg-muted/40 sticky top-0 z-10">
              <TableRow>
                <TableHead className="px-2 py-2 font-semibold">Type</TableHead>
                <TableHead className="px-2 py-2 font-semibold">Project</TableHead>
                <TableHead className="px-2 py-2 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No submissions found.</TableCell>
                </TableRow>
              ) : paginatedData.map((sub: any) => (
                <TableRow key={sub.id} className="border-b hover:bg-muted/20">
                  <TableCell className="px-2 py-1.5">
                    <Badge variant="outline" className="text-[10px] font-semibold border-[#0d9488]/40 text-[#0d9488] whitespace-nowrap">
                      {sub.formType}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2 py-1.5 font-medium max-w-[120px] truncate" title={sub.projectName}>{sub.projectName}</TableCell>
                  <TableCell className="px-2 py-1.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      sub.status === 'Draft' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {sub.status === 'Draft' ? <Clock className="h-2.5 w-2.5" /> : <CheckCircle2 className="h-2.5 w-2.5" />}
                      {' '}{sub.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUnified.length)} of {filteredUnified.length} entries
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 px-2" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium px-2">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" className="h-7 px-2" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


// ==================== SUBMITTED FORMS TABLE ====================

const FORM_COLS = [
  { key: 'OHS',              label: 'OHS'              },
  { key: 'EVM',              label: 'EVM'              },
  { key: 'Road Safety',      label: 'Road Safety'      },
  { key: 'Social (O)',       label: 'Social (O)'       },
  { key: 'Social',           label: 'Social'           },
]

interface MisEntry {
  projectName: string
  contractor: string
  pmc: string
  evm: { raised: number; approved: number; rejected: number; inProgress: number }
  socialO: { raised: number; approved: number; rejected: number; inProgress: number }
  ohs: { raised: number; approved: number; rejected: number; inProgress: number }
  roadSafety: { raised: number; approved: number; rejected: number; inProgress: number }
  social: { raised: number; approved: number; rejected: number; inProgress: number }
}

const fetchMisCounts = async (): Promise<MisEntry[]> => {
  const res = await fetch('/data/mis-form-counts.json')
  if (!res.ok) throw new Error('Failed to load MIS counts')
  return res.json()
}

export function SubmittedFormsTable({ projects }: { projects: Array<{ id: string; name: string; contractor: string }> }) {
  const [search, setSearch] = useState('')

  const { data: misData = [] } = useQuery<MisEntry[]>({
    queryKey: ['mis-form-counts'],
    queryFn: fetchMisCounts,
    staleTime: 5 * 60 * 1000,
  })

  // Build a lookup: normalised project name -> MIS entry
  const misLookup = useMemo(() => {
    const map: Record<string, MisEntry> = {}
    misData.forEach(e => {
      map[e.projectName.toLowerCase().trim()] = e
    })
    return map
  }, [misData])

  const getCount = (mis: MisEntry | undefined, key: string): number => {
    if (!mis) return 0
    switch (key) {
      case 'OHS':        return mis.ohs.raised
      case 'EVM':        return mis.evm.raised
      case 'Road Safety': return mis.roadSafety.raised
      case 'Social (O)': return mis.socialO.raised
      case 'Social':     return mis.social.raised
      default: return 0
    }
  }

  // Build rows from the v3 projects list, supplemented by anything in MIS but not in v3
  const rows = useMemo(() => {
    const v3Names = new Set(projects.map(p => p.name.toLowerCase()))

    const projectRows = projects.map((p, idx) => {
      const mis = misLookup[p.name.toLowerCase().trim()]
      const counts: Record<string, number> = {}
      FORM_COLS.forEach(col => {
        counts[col.key] = getCount(mis, col.key)
      })
      return {
        sno: idx + 1,
        name: p.name,
        contractor: p.contractor || mis?.contractor || '—',
        counts,
        hasMis: !!mis,
      }
    })

    // Extra rows: MIS projects not in v3 payload
    const extraRows: typeof projectRows = []
    misData.forEach((e, i) => {
      if (!v3Names.has(e.projectName.toLowerCase().trim())) {
        const counts: Record<string, number> = {}
        FORM_COLS.forEach(col => { counts[col.key] = getCount(e, col.key) })
        extraRows.push({
          sno: projects.length + i + 1,
          name: e.projectName,
          contractor: e.contractor || '—',
          counts,
          hasMis: true,
        })
      }
    })

    return [...projectRows, ...extraRows].map((r, i) => ({ ...r, sno: i + 1 }))
  }, [projects, misLookup, misData])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows
      .filter(r => r.name.toLowerCase().includes(q) || r.contractor.toLowerCase().includes(q))
      .map((r, i) => ({ ...r, sno: i + 1 }))
  }, [rows, search])



  const totalRow = useMemo(() => {
    const t: Record<string, number> = {}
    FORM_COLS.forEach(col => { t[col.key] = rows.reduce((sum, r) => sum + (r.counts[col.key] || 0), 0) })
    return t
  }, [rows])

  return (
    <Card className="shrink-0 w-full">
        {/* Card header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b bg-muted/20 gap-3">
          <div>
            <p className="text-sm font-bold text-[#0d9488]">Submitted Forms</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} project{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-8 text-xs"
            />
          </div>
        </div>

        <CardContent className="p-0">
          {/* ONE scroll container, ONE table — colgroup keeps all columns aligned */}
          <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-[440px]">
              <table className="w-full text-xs border-collapse table-fixed">
                <colgroup>
                  <col style={{ width: '42px' }} />
                  <col style={{ width: '220px' }} />
                  <col style={{ width: '110px' }} />
                  {FORM_COLS.map(col => <col key={col.key} style={{ width: '90px' }} />)}
                  <col style={{ width: '72px' }} />
                </colgroup>

                <thead className="sticky top-0 z-10">
                  <tr className="bg-muted/40 border-b">
                    <th className="px-3 py-2.5 text-left font-semibold text-foreground">S.No</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-foreground">Project Name</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-foreground">Contractor</th>
                    {FORM_COLS.map(col => (
                      <th key={col.key} className="px-3 py-2.5 text-center font-semibold text-foreground whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                    <th className="px-3 py-2.5 text-center font-semibold text-foreground">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={3 + FORM_COLS.length + 1} className="text-center py-10 text-muted-foreground">
                        No data available.
                      </td>
                    </tr>
                  ) : filtered.map((row, i) => {
                    const rowTotal = FORM_COLS.reduce((sum, col) => sum + (row.counts[col.key] || 0), 0)
                    return (
                      <tr key={row.name} className={`border-b transition-colors hover:bg-muted/20 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                        <td className="px-3 py-2 text-muted-foreground tabular-nums">{row.sno}</td>
                        <td className="px-3 py-2 font-medium text-foreground truncate" title={row.name}>{row.name}</td>
                        <td className="px-3 py-2 text-muted-foreground truncate" title={row.contractor}>{row.contractor}</td>
                        {FORM_COLS.map(col => {
                          const val = row.counts[col.key] || 0
                          return (
                            <td key={col.key} className="px-3 py-2 text-center tabular-nums">
                              {val > 0 ? (
                                <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                                  {val}
                                </span>
                              ) : <span className="text-slate-300 dark:text-slate-700">—</span>}
                            </td>
                          )
                        })}
                        <td className="px-3 py-2 text-center tabular-nums">
                          {rowTotal > 0 ? (
                            <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                              {rowTotal}
                            </span>
                          ) : <span className="text-slate-300 dark:text-slate-700">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>

                <tfoot className="sticky bottom-0 z-10">
                  <tr className="bg-sidebar dark:bg-sidebar/80 border-t-2 border-slate-200 dark:border-slate-700">
                    <td colSpan={3} className="px-3 py-2.5 font-bold text-sidebar-foreground text-xs">Total</td>
                    {FORM_COLS.map(col => (
                      <td key={col.key} className="px-3 py-2.5 text-center font-bold text-foreground tabular-nums">
                        {totalRow[col.key] || 0}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-center font-bold text-indigo-700 tabular-nums">
                      {FORM_COLS.reduce((sum, col) => sum + (totalRow[col.key] || 0), 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </CardContent>


      </Card>
  )
}
