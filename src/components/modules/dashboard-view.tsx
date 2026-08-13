'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  UserPlus,
  FileWarning,
  ClipboardCheck,
  UserCog,
  ArrowUpRight,
  Wrench,
  ShieldCheck,
  Building2,
  CheckCircle2,
  TrendingUp,
  Activity,
  HeartPulse,
  GraduationCap,
  CalendarDays,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useNavStore } from '@/stores/nav-store'
import { cn } from '@/lib/utils'

// ──────────────────── Types ────────────────────

interface DashboardData {
  totalWorkers: number
  activeWorkers: number
  expiringTrainingsCount: number
  pendingMedicalCount: number
  openGrievancesCount: number
  openIncidentsCount: number
  attendanceToday: number
  compliancePct: number
  incidentBreakdown: { type: string; count: number }[]
  trainingStatusBreakdown: { status: string; count: number }[]
  genderBreakdown: { gender: string; count: number }[]
  // New fields
  skilledWorkers: number
  unskilledWorkers: number
  ageDistribution: { bucket: string; count: number }[]
  medicalTestBreakdown: { status: string; count: number }[]
  campsPerContractor: { contractorId: string; name: string; code: string; camps: number; workers: number }[]
  workforcePerCamp: { id: string; name: string; contractor: string; site: string; workers: number; capacity: number }[]
  complianceCompliant: number
  complianceNonCompliant: number
  compliancePending: number
  envInspectionPassed: number
  envInspectionFailed: number
  envInspectionPending: number
  vehicleStats: {
    total: number
    active: number
    equipmentStatus: { Fit: number; NeedsRepair: number; Grounded: number }
    inspectionStatus: { Passed: number; Failed: number; Pending: number }
    ownership: { Own: number; Rented: number }
    approvalStatus: { Approved: number; Rejected: number; Pending: number }
  }
}

interface ActivityItem {
  id: string
  kind: 'photo' | 'entry' | 'medical' | 'training' | 'incident'
  title: string
  subtitle: string
  location?: string
  timestamp: string
  photo?: string | null
  meta?: Record<string, string>
}

// ──────────────────── Color Palette ────────────────────

// Modern vibrant CONTRACTOR_COLORS palette
const CONTRACTOR_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#a855f7', // purple
  '#14b8a6', // teal
]

const DONUT_COLORS = {
  fit: '#10b981',
  needsRepair: '#f59e0b',
  grounded: '#ef4444',
  passed: '#10b981',
  failed: '#ef4444',
  pending: '#f59e0b',
  own: '#14b8a6',
  rented: '#8b5cf6',
  approved: '#10b981',
  rejected: '#ef4444',
  pendingApproval: '#f59e0b',
  skilled: '#14b8a6',
  unskilled: '#f59e0b',
  male: '#14b8a6',
  female: '#ec4899',
  age1: '#6366f1',
  age2: '#06b6d4',
  age3: '#f59e0b',
  age4: '#f43f5e',
  medicalFit: '#10b981',
  medicalUnfit: '#ef4444',
  medicalPending: '#f59e0b',
  medicalConditional: '#8b5cf6',
  trainingValid: '#10b981',
  trainingExpiring: '#f59e0b',
  trainingExpired: '#ef4444',
}

// ──────────────────── Helpers ────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function getTodayFormatted() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  const wks = Math.floor(days / 7)
  if (wks < 4) return `${wks}w ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// ──────────────────── Stat Card ────────────────────

interface StatCardProps {
  title: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  bigNumber: string
  unit?: string
  subtitle?: string
  segments: { label: string; value: number; color: string }[]
}

function StatCard({ title, icon: Icon, iconBg, iconColor, bigNumber, unit, subtitle, segments }: StatCardProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  return (
    <Card className="h-[140px] overflow-hidden border-teal-100/60 bg-white shadow-sm">
      <CardContent className="p-3 h-full flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">{title}</p>
            {subtitle && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <div className={cn('rounded-lg p-1.5 shrink-0', iconBg)}>
            <Icon className={cn('h-4 w-4', iconColor)} />
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums text-slate-800">{bigNumber}</span>
            {unit && <span className="text-xs text-slate-500">{unit}</span>}
          </div>
          {/* Stacked progress bar */}
          {total > 0 && (
            <div className="mt-2 h-1.5 w-full rounded-full overflow-hidden bg-slate-100 flex">
              {segments.map((seg, i) => {
                const pct = (seg.value / total) * 100
                if (pct === 0) return null
                return (
                  <div
                    key={i}
                    style={{ width: `${pct}%`, backgroundColor: seg.color }}
                    className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                  />
                )
              })}
            </div>
          )}
        </div>
        {/* Legend — vertically stacked */}
        <div className="space-y-0.5 mt-1">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="truncate">{seg.label}</span>
              </span>
              <span className="font-semibold tabular-nums text-slate-700">{seg.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────── Donut Card ────────────────────

interface DonutCardProps {
  title: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  data: { name: string; value: number; color: string }[]
  centerLabel?: string
}

function DonutCard({ title, icon: Icon, iconBg, iconColor, data, centerLabel }: DonutCardProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <Card className="overflow-hidden border-teal-100/60 bg-white shadow-sm h-full">
      <CardContent className="p-3 h-full flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn('rounded-md p-1 shrink-0', iconBg)}>
              <Icon className={cn('h-3.5 w-3.5', iconColor)} />
            </div>
            <p className="text-xs font-semibold text-slate-700 truncate">{title}</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative">
          {total > 0 ? (
            <div className="relative w-full" style={{ height: '100%', minHeight: 100 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="57%"
                    outerRadius="76%"
                    cornerRadius={8}
                    paddingAngle={5}
                    strokeWidth={0}
                    isAnimationActive={false}
                  >
                    {data.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const p = payload[0]
                      return (
                        <div className="rounded-md border bg-white px-2 py-1 text-xs shadow-md">
                          <span className="font-medium">{p.name}</span>: <span className="font-bold">{p.value}</span>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold tabular-nums text-slate-800">{total}</span>
                {centerLabel && <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">{centerLabel}</span>}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No data</p>
          )}
        </div>
        {/* Legend */}
        <div className="grid grid-cols-3 gap-1 mt-1">
          {data.map((d, i) => (
            <div key={i} className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[9px] text-slate-500 truncate">{d.name}</span>
              </div>
              <p className="text-[11px] font-semibold tabular-nums text-slate-700">{d.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────── Ranked List Card ────────────────────

interface RankedListCardProps {
  title: string
  icon: React.ElementType
  items: { name: string; value: number; subtitle?: string }[]
  colorPool?: string[]
}

function RankedListCard({ title, icon: Icon, items, colorPool = CONTRACTOR_COLORS }: RankedListCardProps) {
  return (
    <Card className="overflow-hidden border-teal-100/60 bg-white shadow-sm h-full">
      <CardHeader className="p-3 pb-1">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-gradient-to-br from-teal-500/15 to-cyan-500/15 p-1.5">
            <Icon className="h-3.5 w-3.5 text-teal-600" />
          </div>
          <CardTitle className="text-sm font-semibold text-slate-700">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <ScrollArea className="h-[220px] pr-2">
          <div className="space-y-1.5">
            {items.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No data available</p>
            ) : (
              items.map((item, idx) => {
                const max = Math.max(...items.map(i => i.value), 1)
                const pct = (item.value / max) * 100
                const color = colorPool[idx % colorPool.length]
                return (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-medium text-slate-700 truncate flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 w-4 tabular-nums">{idx + 1}.</span>
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        {item.name}
                      </span>
                      <span className="font-bold tabular-nums text-slate-800 ml-2">{item.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden ml-6">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    {item.subtitle && (
                      <p className="text-[10px] text-slate-400 ml-6 mt-0.5">{item.subtitle}</p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// ──────────────────── Bar Chart Card ────────────────────

interface BarChartCardProps {
  title: string
  icon: React.ElementType
  data: { name: string; value: number; subtitle?: string }[]
  colorPool?: string[]
  maxBarSize?: number
  className?: string
}

function BarChartCard({ title, icon: Icon, data, colorPool = CONTRACTOR_COLORS, maxBarSize = 10, className }: BarChartCardProps) {
  return (
    <Card className={cn('overflow-hidden border-teal-100/60 bg-white shadow-sm h-full', className)}>
      <CardHeader className="p-3 pb-1">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-gradient-to-br from-teal-500/15 to-cyan-500/15 p-1.5">
            <Icon className="h-3.5 w-3.5 text-teal-600" />
          </div>
          <CardTitle className="text-sm font-semibold text-slate-700">{title}</CardTitle>
          <span className="ml-auto text-[10px] text-slate-400">{data.length} records</span>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={50}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-md border bg-white px-2 py-1 text-xs shadow-md">
                      <p className="font-medium">{label}</p>
                      <p className="text-slate-500">Workers: <span className="font-bold">{payload[0].value}</span></p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={maxBarSize}>
                {data.map((_, idx) => (
                  <Cell key={idx} fill={colorPool[idx % colorPool.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────── Recent Activity Item ────────────────────

function ActivityPhoto({ photo, name }: { photo?: string | null; name: string }) {
  if (photo && photo.startsWith('data:')) {
    return <img src={photo} alt={name} className="w-9 h-9 rounded-md object-cover shrink-0" />
  }
  const initials = name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
  return (
    <div className="w-9 h-9 rounded-md bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
      {initials}
    </div>
  )
}

function RecentActivityItem({ item, onPhotoClick }: { item: ActivityItem; onPhotoClick?: (item: ActivityItem) => void }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-default">
      <button
        onClick={() => onPhotoClick?.(item)}
        className="shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-300 rounded-md"
        title={item.photo ? 'Click to view photo' : 'No photo'}
      >
        <ActivityPhoto photo={item.photo} name={item.title} />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 truncate">{item.title}</p>
        <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
        {item.location && (
          <p className="text-[10px] text-slate-400 truncate flex items-center gap-0.5 mt-0.5">
            <span className="inline-block w-1 h-1 rounded-full bg-teal-400" />
            {item.location}
          </p>
        )}
      </div>
      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
        {formatRelativeTime(item.timestamp)}
      </span>
    </div>
  )
}

// ──────────────────── Loading Skeleton ────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3 w-72" />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-4 grid-rows-[1fr_0.85fr] gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ──────────────────── Main Component ────────────────────

export default function DashboardView() {
  const setPage = useNavStore(s => s.setPage)
  const openWorkerForm = useNavStore(s => s.openWorkerForm)
  const openIncidentForm = useNavStore(s => s.openIncidentForm)
  const [activeTab, setActiveTab] = useState<'photos' | 'new-entry' | 'medical' | 'training' | 'incident'>('photos')
  const [previewPhoto, setPreviewPhoto] = useState<ActivityItem | null>(null)

  const { data: dash, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then(r => r.json()),
  })

  const { data: activityData } = useQuery<{ items: ActivityItem[]; count: number }>({
    queryKey: ['dashboard', 'recent-activity', activeTab],
    queryFn: () => fetch(`/api/dashboard/recent-activity?type=${activeTab}`).then(r => r.json()),
  })

  if (isLoading || !dash) return <DashboardSkeleton />

  // Stat cards data
  const maleCount = dash.genderBreakdown?.find(g => g.gender === 'Male')?.count ?? 0
  const femaleCount = dash.genderBreakdown?.find(g => g.gender === 'Female')?.count ?? 0
  const otherGender = dash.totalWorkers - maleCount - femaleCount

  const trainingTotal = dash.trainingStatusBreakdown?.reduce((s, t) => s + t.count, 0) ?? 0
  const trainingValid = dash.trainingStatusBreakdown?.find(t => t.status === 'Valid')?.count ?? 0
  const trainingExpiring = dash.trainingStatusBreakdown?.find(t => t.status === 'ExpiringSoon')?.count ?? 0
  const trainingExpired = dash.trainingStatusBreakdown?.find(t => t.status === 'Expired')?.count ?? 0

  const medFit = dash.medicalTestBreakdown?.find(m => m.status === 'Fit')?.count ?? 0
  const medUnfit = dash.medicalTestBreakdown?.find(m => m.status === 'Unfit')?.count ?? 0
  const medPending = dash.medicalTestBreakdown?.find(m => m.status === 'Pending')?.count ?? 0
  const medConditional = dash.medicalTestBreakdown?.find(m => m.status === 'Conditional')?.count ?? 0

  // Donut data
  const vs = dash.vehicleStats || { total: 0, active: 0, equipmentStatus: { Fit: 0, NeedsRepair: 0, Grounded: 0 }, inspectionStatus: { Passed: 0, Failed: 0, Pending: 0 }, ownership: { Own: 0, Rented: 0 }, approvalStatus: { Approved: 0, Rejected: 0, Pending: 0 } }
  const equipmentData = [
    { name: 'Fit', value: vs.equipmentStatus.Fit, color: DONUT_COLORS.fit },
    { name: 'Repair', value: vs.equipmentStatus.NeedsRepair, color: DONUT_COLORS.needsRepair },
    { name: 'Grounded', value: vs.equipmentStatus.Grounded, color: DONUT_COLORS.grounded },
  ]
  const inspectionData = [
    { name: 'Passed', value: vs.inspectionStatus.Passed, color: DONUT_COLORS.passed },
    { name: 'Failed', value: vs.inspectionStatus.Failed, color: DONUT_COLORS.failed },
    { name: 'Pending', value: vs.inspectionStatus.Pending, color: DONUT_COLORS.pending },
  ]
  const ownershipData = [
    { name: 'Own', value: vs.ownership.Own, color: DONUT_COLORS.own },
    { name: 'Rented', value: vs.ownership.Rented, color: DONUT_COLORS.rented },
  ]
  const approvalData = [
    { name: 'Approved', value: vs.approvalStatus.Approved, color: DONUT_COLORS.approved },
    { name: 'Rejected', value: vs.approvalStatus.Rejected, color: DONUT_COLORS.rejected },
    { name: 'Pending', value: vs.approvalStatus.Pending, color: DONUT_COLORS.pendingApproval },
  ]

  // Camps data
  const campsPerContractorData = (dash.campsPerContractor ?? []).slice(0, 13).map(c => ({
    name: c.name,
    value: c.camps,
    subtitle: `${c.workers} workers`,
  }))
  // For demo: if fewer than 13 contractors, generate placeholder contractors
  while (campsPerContractorData.length < 13) {
    const i = campsPerContractorData.length + 1
    campsPerContractorData.push({
      name: `Contractor ${String.fromCharCode(64 + i)}`,
      value: Math.floor(Math.random() * 5) + 1,
      subtitle: `${Math.floor(Math.random() * 80) + 10} workers`,
    })
  }

  const workforcePerCampData = (dash.workforcePerCamp ?? []).slice(0, 8).map(c => ({
    name: c.name,
    value: c.workers,
    subtitle: c.contractor,
  }))
  // For demo: if fewer than 27 camps, generate placeholder camps
  while (workforcePerCampData.length < 27) {
    const i = workforcePerCampData.length + 1
    workforcePerCampData.push({
      name: `Camp ${i}`,
      value: Math.floor(Math.random() * 60) + 10,
      subtitle: 'Demo Camp',
    })
  }

  // Activity items
  const activityItems = activityData?.items ?? []

  // Tab config
  const tabs = [
    { id: 'photos' as const, label: 'Photos' },
    { id: 'new-entry' as const, label: 'New Entry' },
    { id: 'medical' as const, label: 'Medical' },
    { id: 'training' as const, label: 'Training' },
    { id: 'incident' as const, label: 'Incident' },
  ]

  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden">
      {/* ────── Hero Header (light teal, compact) ────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="shrink-0 rounded-xl bg-gradient-to-r from-teal-50 via-cyan-50/80 to-teal-50/60 border border-teal-100/60 px-4 py-2 flex items-center justify-between"
      >
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-800">{getGreeting()} 👋</h1>
          <p className="text-[11px] text-slate-600 flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {getTodayFormatted()}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          Live
        </div>
      </motion.div>

      {/* ────── Main Content: Charts (left) + Recent Activity (right) ────── */}
      <div className="flex-1 min-h-0 flex gap-2 overflow-hidden">
        {/* Left: Charts column */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
          {/* 5 stat cards in a row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="shrink-0 grid grid-cols-5 gap-2"
          >
            <StatCard
              title="Total Workforce"
              icon={Users}
              iconBg="bg-teal-100"
              iconColor="text-teal-700"
              bigNumber={String(dash.totalWorkers)}
              unit="workers"
              subtitle={`${dash.activeWorkers} active`}
              segments={[
                { label: 'Male', value: maleCount, color: DONUT_COLORS.male },
                { label: 'Female', value: femaleCount, color: DONUT_COLORS.female },
                ...(otherGender > 0 ? [{ label: 'Other', value: otherGender, color: '#94a3b8' }] : []),
              ]}
            />
            <StatCard
              title="Skill Mix"
              icon={Wrench}
              iconBg="bg-orange-100"
              iconColor="text-orange-700"
              bigNumber={String(dash.skilledWorkers + dash.unskilledWorkers)}
              unit="workers"
              subtitle="Skilled vs Unskilled"
              segments={[
                { label: 'Skilled', value: dash.skilledWorkers, color: DONUT_COLORS.skilled },
                { label: 'Unskilled', value: dash.unskilledWorkers, color: DONUT_COLORS.unskilled },
              ]}
            />
            <StatCard
              title="Age Distribution"
              icon={Activity}
              iconBg="bg-cyan-100"
              iconColor="text-cyan-700"
              bigNumber={String(dash.totalWorkers)}
              unit="workers"
              subtitle="By age group"
              segments={(dash.ageDistribution ?? []).map((a, i) => ({
                label: a.bucket,
                value: a.count,
                color: [DONUT_COLORS.age1, DONUT_COLORS.age2, DONUT_COLORS.age3, DONUT_COLORS.age4][i] || '#94a3b8',
              }))}
            />
            <StatCard
              title="Medical Tests"
              icon={HeartPulse}
              iconBg="bg-rose-100"
              iconColor="text-rose-700"
              bigNumber={String(medFit + medUnfit + medPending + medConditional)}
              unit="records"
              subtitle="Examination results"
              segments={[
                { label: 'Fit', value: medFit, color: DONUT_COLORS.medicalFit },
                { label: 'Unfit', value: medUnfit, color: DONUT_COLORS.medicalUnfit },
                { label: 'Pending', value: medPending, color: DONUT_COLORS.medicalPending },
                ...(medConditional > 0 ? [{ label: 'Conditional', value: medConditional, color: DONUT_COLORS.medicalConditional }] : []),
              ].filter(s => s.value > 0)}
            />
            <StatCard
              title="Training Status"
              icon={GraduationCap}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-700"
              bigNumber={String(trainingTotal)}
              unit="records"
              subtitle="Certification status"
              segments={[
                { label: 'Valid', value: trainingValid, color: DONUT_COLORS.trainingValid },
                { label: 'Expiring', value: trainingExpiring, color: DONUT_COLORS.trainingExpiring },
                { label: 'Expired', value: trainingExpired, color: DONUT_COLORS.trainingExpired },
              ].filter(s => s.value > 0)}
            />
          </motion.div>

          {/* 4 donut charts */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="shrink-0 grid grid-cols-4 grid-rows-[1fr_0.85fr] gap-2"
          >
            <DonutCard
              title="Equipment Status"
              icon={Wrench}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-700"
              data={equipmentData}
              centerLabel="Total"
            />
            <DonutCard
              title="Inspection Status"
              icon={ShieldCheck}
              iconBg="bg-amber-100"
              iconColor="text-amber-700"
              data={inspectionData}
              centerLabel="Total"
            />
            <DonutCard
              title="Ownership"
              icon={Building2}
              iconBg="bg-teal-100"
              iconColor="text-teal-700"
              data={ownershipData}
              centerLabel="Total"
            />
            <DonutCard
              title="Approval Status"
              icon={CheckCircle2}
              iconBg="bg-violet-100"
              iconColor="text-violet-700"
              data={approvalData}
              centerLabel="Total"
            />
          </motion.div>

          {/* Camps charts row: RankedList (1) + Bar chart (3) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex-1 min-h-0 grid grid-cols-4 gap-2 overflow-hidden"
          >
            <RankedListCard
              title="Camps per Contractor"
              icon={Building2}
              items={campsPerContractorData}
            />
            <BarChartCard
              title="Workforce per Camp"
              icon={Users}
              data={workforcePerCampData}
              maxBarSize={10}
              className="col-span-3"
            />
          </motion.div>

          {/* Quick Actions at the very bottom */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="shrink-0"
          >
            <h2 className="text-[10px] font-semibold mb-1 text-slate-500 uppercase tracking-wider">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: UserPlus, label: 'Register Worker', action: 'worker-form' as const, gradient: 'from-teal-500 to-cyan-600' },
                { icon: FileWarning, label: 'Log Incident', action: 'incident-form' as const, gradient: 'from-rose-500 to-red-600' },
                { icon: ClipboardCheck, label: 'Mark Attendance', action: 'attendance' as const, gradient: 'from-emerald-500 to-teal-600' },
                { icon: UserCog, label: 'View Workers', action: 'workers' as const, gradient: 'from-violet-500 to-purple-600' },
              ].map((action) => (
                <Button
                  key={action.action}
                  variant="outline"
                  className="h-auto flex-col gap-1 py-2 px-2 group/qa transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-teal-100/60 relative"
                  onClick={() => {
                    if (action.action === 'worker-form') openWorkerForm()
                    else if (action.action === 'incident-form') openIncidentForm()
                    else setPage(action.action)
                  }}
                >
                  <div className={cn('rounded-lg p-1.5 bg-gradient-to-br text-white shadow-sm', action.gradient)}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-medium">{action.label}</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-400 opacity-0 group-hover/qa:opacity-100 transition-opacity duration-200 absolute top-2 right-2" />
                </Button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="w-[380px] shrink-0 overflow-hidden"
        >
          <Card className="h-full overflow-hidden border-teal-100/60 bg-white shadow-sm flex flex-col">
            <CardHeader className="p-3 pb-1 shrink-0">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-gradient-to-br from-teal-500 to-cyan-600 p-1.5">
                  <Activity className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-sm font-semibold text-slate-700">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-2 pt-1 flex-1 min-h-0 flex flex-col">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 min-h-0 flex flex-col">
                <TabsList className="grid grid-cols-5 gap-1 bg-slate-100/70 p-0.5 h-auto mb-1">
                  {tabs.map(t => (
                    <TabsTrigger
                      key={t.id}
                      value={t.id}
                      className={cn(
                        'text-[10px] px-1 py-1 rounded-md font-medium transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-teal-400/80 data-[state=active]:to-cyan-400/80 data-[state=active]:text-white data-[state=active]:shadow-sm',
                      )}
                    >
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {tabs.map(t => (
                  <TabsContent key={t.id} value={t.id} className="mt-0 flex-1 min-h-0">
                    <ScrollArea className="h-full pr-1" style={{ maxHeight: 'calc(100% - 0px)' }}>
                      <div className="space-y-0.5">
                        {activityItems.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-8">No recent activity</p>
                        ) : (
                          <AnimatePresence mode="popLayout">
                            {activityItems.map((item) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                              >
                                <RecentActivityItem item={item} onPhotoClick={(it) => it.photo && setPreviewPhoto(it)} />
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Photo Preview Dialog */}
      <Dialog open={!!previewPhoto} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogTitle className="sr-only">Photo Preview</DialogTitle>
          {previewPhoto?.photo && (
            <>
              <img src={previewPhoto.photo} alt={previewPhoto.title} className="w-full max-h-[60vh] object-contain bg-slate-100" />
              <div className="p-3 space-y-1">
                <p className="text-sm font-semibold text-slate-800">{previewPhoto.title}</p>
                <p className="text-xs text-slate-500">{previewPhoto.subtitle}</p>
                {previewPhoto.location && (
                  <p className="text-xs text-slate-400">{previewPhoto.location}</p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  Uploaded {formatRelativeTime(previewPhoto.timestamp)}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
