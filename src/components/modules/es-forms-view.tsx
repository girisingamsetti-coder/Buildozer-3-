'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Plus, Search, X, FileText, ChevronDown, Trash2, Calendar,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

// ==================== TYPES ====================

type FormType = 'EHS' | 'OHS' | 'EVM' | 'Road Safety' | 'Social' | 'Social Legacy'
type FormStatus = 'PMC' | 'PGMC' | 'CRDA' | 'Approved' | 'Rejected' | 'Pending'

interface FormEntry {
  id: string
  formType: FormType
  submittedBy: string
  location: string
  date: string
  status: FormStatus
  remarks?: string
}

const FORM_TYPES: FormType[] = ['EHS', 'OHS', 'EVM', 'Road Safety', 'Social', 'Social Legacy']

const STATUS_COLORS: Record<FormStatus, string> = {
  PMC: '#3b82f6',
  PGMC: '#f59e0b',
  CRDA: '#8b5cf6',
  Approved: '#10b981',
  Rejected: '#ef4444',
  Pending: '#f97316',
}

const STATUS_OPTIONS: FormStatus[] = ['PMC', 'PGMC', 'CRDA', 'Approved', 'Rejected', 'Pending']

// ==================== LOCAL STORAGE ====================

const STORAGE_KEY = 'es-forms-data-v2'

function seedData(): FormEntry[] {
  const forms: FormEntry[] = []
  const statuses: FormStatus[] = ['PMC', 'PGMC', 'CRDA', 'Approved', 'Rejected', 'Pending']
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
  const counts: Record<FormType, number> = { EHS: 18, OHS: 14, EVM: 12, 'Road Safety': 10, Social: 16, 'Social Legacy': 8 }
  FORM_TYPES.forEach(type => {
    for (let i = 0; i < counts[type]; i++) {
      const d = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      forms.push({
        id: `${type}-${i}-${Math.random()}`,
        formType: type,
        submittedBy: names[Math.floor(Math.random() * names.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        date: d.toISOString().split('T')[0],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      })
    }
  })
  return forms
}

function loadForms(): FormEntry[] {
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

function saveForms(forms: FormEntry[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms))
}

// ==================== PROJECT SUMMARY TABLE ====================

const SUB_COLS = ['Created', 'Not Ready', 'PMC', 'PGMC', 'CRDA', 'Approved', 'In Progress', 'Rejected'] as const
type SubCol = typeof SUB_COLS[number]

const STATUS_TO_SUBCOL: Record<FormStatus, SubCol | null> = {
  PMC: 'PMC',
  PGMC: 'PGMC',
  CRDA: 'CRDA',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Pending: 'Not Ready',
}

function ProjectSummaryTable({ forms }: { forms: FormEntry[] }) {
  const projects = Array.from(new Set(forms.map(f => f.location))).sort()

  const getCellValue = (project: string, type: FormType, sub: SubCol): number => {
    const projectForms = forms.filter(f => f.location === project && f.formType === type)
    if (sub === 'Created') return projectForms.length
    const mapped = STATUS_TO_SUBCOL
    return projectForms.filter(f => mapped[f.status] === sub).length
  }

  const HEADER_BG = 'bg-[#3b5998]'
  const HEADER_TEXT = 'text-white text-[10px] font-semibold'

  return (
    <Card className="shrink-0">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse w-max min-w-full">
            <thead>
              {/* Row 1: Project + Form Type groups */}
              <tr>
                <th
                  rowSpan={2}
                  className={`${HEADER_BG} ${HEADER_TEXT} sticky left-0 z-20 px-3 py-2 text-left border border-blue-400/40 min-w-[140px] align-middle`}
                >
                  Project
                </th>
                {FORM_TYPES.map(type => (
                  <th
                    key={type}
                    colSpan={SUB_COLS.length}
                    className={`${HEADER_BG} ${HEADER_TEXT} px-2 py-2 text-center border border-blue-400/40 whitespace-nowrap`}
                  >
                    {type}
                  </th>
                ))}
              </tr>
              {/* Row 2: Sub-columns */}
              <tr>
                {FORM_TYPES.map(type =>
                  SUB_COLS.map(sub => (
                    <th
                      key={`${type}-${sub}`}
                      className={`${HEADER_BG} ${HEADER_TEXT} px-2 py-1.5 text-center border border-blue-400/40 whitespace-nowrap`}
                    >
                      {sub}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={1 + FORM_TYPES.length * SUB_COLS.length} className="text-center py-6 text-muted-foreground">
                    No data available
                  </td>
                </tr>
              ) : projects.map((project, pi) => (
                <tr key={project} className={pi % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                  <td className="sticky left-0 z-10 px-3 py-2 font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 bg-inherit min-w-[140px] whitespace-nowrap">
                    {project}
                  </td>
                  {FORM_TYPES.map(type =>
                    SUB_COLS.map(sub => {
                      const val = getCellValue(project, type, sub)
                      return (
                        <td
                          key={`${type}-${sub}`}
                          className="px-3 py-2 text-center border border-slate-200 dark:border-slate-700 tabular-nums"
                        >
                          {val > 0 ? (
                            <span className={`font-semibold ${
                              sub === 'Approved' ? 'text-emerald-600' :
                              sub === 'Rejected' ? 'text-red-500' :
                              sub === 'Not Ready' ? 'text-orange-500' :
                              sub === 'Created' ? 'text-[#0d9488]' :
                              'text-slate-700 dark:text-slate-300'
                            }`}>{val}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      )
                    })
                  )}
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-blue-50 dark:bg-blue-950/30 font-semibold">
                <td className="sticky left-0 z-10 px-3 py-2 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-950/30 whitespace-nowrap">
                  Total
                </td>
                {FORM_TYPES.map(type =>
                  SUB_COLS.map(sub => {
                    const total = projects.reduce((acc, p) => acc + getCellValue(p, type, sub), 0)
                    return (
                      <td
                        key={`total-${type}-${sub}`}
                        className="px-3 py-2 text-center border border-slate-200 dark:border-slate-700 tabular-nums"
                      >
                        {total > 0 ? (
                          <span className={`font-bold ${
                            sub === 'Approved' ? 'text-emerald-600' :
                            sub === 'Rejected' ? 'text-red-500' :
                            sub === 'Not Ready' ? 'text-orange-500' :
                            sub === 'Created' ? 'text-[#0d9488]' :
                            'text-slate-700 dark:text-slate-300'
                          }`}>{total}</span>
                        ) : '—'}
                      </td>
                    )
                  })
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== STAT CARD ====================

function StatCard({ formType, entries }: { formType: FormType; entries: FormEntry[] }) {
  const total = entries.length
  const pending = entries.filter(e => e.status === 'Pending').length
  const breakdown = STATUS_OPTIONS.filter(s => s !== 'Pending').map(s => ({
    name: s,
    value: entries.filter(e => e.status === s).length,
    color: STATUS_COLORS[s],
  })).filter(d => d.value > 0)

  const chartData = breakdown.length > 0 ? breakdown : [{ name: 'None', value: 1, color: '#e2e8f0' }]

  return (
    <Card className="flex-1 min-w-0 border shadow-sm">
      <CardContent className="p-3 flex flex-col gap-2">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate text-center">{formType}</p>
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
              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">{total}</span>
            <span className="text-[9px] text-muted-foreground font-medium">Created</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          {breakdown.map(b => (
            <span key={b.name} className="flex items-center gap-1 text-[9px] text-slate-600 dark:text-slate-300">
              <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
              {b.name}: {b.value}
            </span>
          ))}
        </div>
        <div className="border border-orange-400 rounded-md px-2 py-1.5 text-center bg-orange-50 dark:bg-orange-900/20">
          <p className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">Pending</p>
          <p className="text-xl font-black text-orange-500 leading-none">{pending}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== ADD FORM DIALOG ====================

function AddFormDialog({
  open, onOpenChange, defaultType, onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultType: FormType | null
  onSave: (entry: FormEntry) => void
}) {
  const [formType, setFormType] = useState<FormType>(defaultType || 'EHS')
  const [submittedBy, setSubmittedBy] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState<FormStatus>('Pending')
  const [remarks, setRemarks] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!submittedBy && !location) {
      toast.error('Failed to Create')
      return
    }
    onSave({ id: `${formType}-${Date.now()}`, formType, submittedBy: submittedBy || '—', location: location || '—', date, status, remarks })
    toast.success('Form submission recorded')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Form Submission</DialogTitle>
          <DialogDescription>Record a new E&S form submission.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Form Type</Label>
              <Select value={formType} onValueChange={v => setFormType(v as FormType)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{FORM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as FormStatus)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Submitted By</Label>
            <Input className="h-9 text-sm" placeholder="Name" value={submittedBy} onChange={e => setSubmittedBy(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Location</Label>
              <Input className="h-9 text-sm" placeholder="Camp / Site" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Date</Label>
              <Input className="h-9 text-sm" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Remarks</Label>
            <Input className="h-9 text-sm" placeholder="Optional" value={remarks} onChange={e => setRemarks(e.target.value)} />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== MAIN VIEW ====================

export default function EsFormsView() {
  const [forms, setForms] = useState<FormEntry[]>(() => loadForms())
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [addOpen, setAddOpen] = useState(false)
  const [addType, setAddType] = useState<FormType | null>(null)

  const handleSave = (entry: FormEntry) => {
    const updated = [entry, ...forms]
    setForms(updated)
    saveForms(updated)
  }

  const handleDelete = (id: string) => {
    const updated = forms.filter(f => f.id !== id)
    setForms(updated)
    saveForms(updated)
    toast.success('Record deleted')
  }

  const filtered = useMemo(() => forms.filter(f => {
    if (typeFilter && f.formType !== typeFilter) return false
    if (statusFilter && f.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!f.formType.toLowerCase().includes(q) && !f.submittedBy.toLowerCase().includes(q) && !f.location.toLowerCase().includes(q)) return false
    }
    return true
  }).sort((a, b) => b.date.localeCompare(a.date)), [forms, search, typeFilter, statusFilter])

  const hasFilter = !!(search || typeFilter || statusFilter)

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div className="hidden sm:block">
          <h1 className="text-2xl font-bold tracking-tight">E&S Forms</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage E&S form submissions across all categories.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white gap-1.5">
              <Plus className="h-4 w-4" />
              Add New
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {FORM_TYPES.map(type => (
              <DropdownMenuItem key={type} onClick={() => { setAddType(type); setAddOpen(true) }} className="cursor-pointer gap-2">
                <FileText className="h-3.5 w-3.5 text-[#0d9488]" />
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stat Cards — fills full width */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 shrink-0">
        {FORM_TYPES.map(type => (
          <StatCard key={type} formType={type} entries={forms.filter(f => f.formType === type)} />
        ))}
      </div>

      {/* Project Summary Table */}
      <ProjectSummaryTable forms={forms} />

      {/* Filter Bar */}
      <Card className="shrink-0 py-0">
        <CardContent className="px-3 py-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by form type, person, location..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Form Type" /></SelectTrigger>
              <SelectContent>{FORM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            {hasFilter && (
              <Button variant="outline" size="sm" className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
                onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter('') }}>
                Clear <X className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="p-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="text-xs">Form Type</TableHead>
                <TableHead className="text-xs">Submitted By</TableHead>
                <TableHead className="text-xs">Location</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Remarks</TableHead>
                <TableHead className="text-xs w-14"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">No form submissions found.</TableCell>
                </TableRow>
              ) : filtered.map(entry => (
                <TableRow key={entry.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-semibold border-[#0d9488]/40 text-[#0d9488]">{entry.formType}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{entry.submittedBy}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{entry.location}</TableCell>
                  <TableCell className="text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />{entry.date}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: STATUS_COLORS[entry.status] }}>
                      {entry.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{entry.remarks || '—'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {addOpen && (
        <AddFormDialog key={String(addType)} open={addOpen} onOpenChange={setAddOpen} defaultType={addType} onSave={handleSave} />
      )}
    </div>
  )
}
