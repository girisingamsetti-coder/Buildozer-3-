'use client'

import { useState, useEffect } from 'react'
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
  MapPin,
  HardHat,
  Tent,
  FolderKanban,
  Search,
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { useNavStore } from '@/stores/nav-store'
import { useIsMobile } from '@/hooks/use-mobile'
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
  className?: string
}

function StatCard({ title, icon: Icon, iconBg, iconColor, bigNumber, unit, subtitle, segments, className }: StatCardProps) {
  const isDeviceMobile = useIsMobile()
  const mobileViewConfig = useNavStore(s => s.mobileView)
  const isMobile = isDeviceMobile || !!mobileViewConfig

  const total = segments.reduce((s, seg) => s + seg.value, 0)
  // Use a uniform distinct color for all TOTAL tiles (light grey)
  const mainColor = '#64748b';
  const bgMap: Record<string, string> = {
    'bg-teal-500': 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400',
    'bg-orange-500': 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
    'bg-purple-500': 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
    'bg-emerald-500': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  }
  const iconStyleClasses = bgMap[iconBg] || 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

  let displayCards: { label: string; value: string | number; color: string; pct: string | null }[] = []
  if (segments.length <= 3) {
    displayCards.push({
      label: ('TOTAL ' + (unit || '')).trim().toUpperCase(),
      value: bigNumber,
      color: '#64748b',
      pct: null
    })
  }

  segments.forEach(seg => {
    displayCards.push({
      label: seg.label.toUpperCase(),
      value: String(seg.value),
      color: seg.color,
      pct: total > 0 ? Math.round((seg.value / total) * 100) + '%' : '0%'
    })
  })



  return (
    <Card className={cn(className || (isMobile ? "h-auto" : "h-full"), "overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-[16px] p-3.5 flex flex-col")}>
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn('rounded-xl p-2.5 shrink-0', iconStyleClasses)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{title}</h3>
            {subtitle && <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="h-7 w-7 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0 ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m9 18 6-6-6-6" /></svg>
        </div>
      </div>

      <div className="grid grid-cols-2 grid-rows-2 gap-2 flex-1">
        {displayCards.slice(0, 4).map((card, i) => {
          const isTotal = i === 0 && card.label.startsWith('TOTAL');
          let mainColor = card.color;
          const lbl = card.label;

          if (isTotal) {
            mainColor = '#64748b'; // light grey
          } else if (['APPROVED', 'COMPLETED', 'PASSED', 'VALID', 'FIT'].includes(lbl)) {
            mainColor = '#10b981'; // light green
          } else if (['PENDING', 'DELAYED', 'CONDITIONAL', 'EXPIRING SOON', 'REPAIR'].includes(lbl)) {
            mainColor = '#f97316'; // light orange
          } else if (['REJECTED', 'FAILED', 'EXPIRED', 'UNFIT', 'GROUNDED', 'NOT COMPLETED'].includes(lbl)) {
            mainColor = '#ef4444'; // light red
          }

          const bgColor = `${mainColor}12`;
          const textColor = mainColor;
          const darkBgColor = `${mainColor}15`;
          const borderColor = `${mainColor}30`;
          const isFullWidth = isTotal && displayCards.length === 3;
          const pushToBottom = displayCards.length <= 2;

          return (
            <div key={i} className={cn("sub-tile rounded-xl p-2.5 flex flex-col justify-between border transition-all duration-300 hover:z-10 hover:-translate-y-1 hover:border-teal-500 hover:shadow-[0_8px_24px_-4px_rgba(20,184,166,0.2)] hover:brightness-95 dark:hover:brightness-110", isFullWidth && "col-span-2", pushToBottom && "row-start-2")} style={{ backgroundColor: bgColor, borderColor }} >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] font-bold tracking-wider truncate" style={{ color: textColor }}>
                  {card.label}
                </span>
                {card.pct && (
                  <span className="text-[10px] font-bold shrink-0" style={{ color: textColor }}>
                    {card.pct}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{card.value}</span>
              </div>
            </div>
          )
        })}
      </div>
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
  centerValue?: string | number
  centerLabel?: string
}

function DonutCard({ title, icon: Icon, iconBg, iconColor, data, centerValue, centerLabel }: DonutCardProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const displayValue = centerValue !== undefined ? centerValue : total
  return (
    <Card className="overflow-hidden border-teal-100/60 bg-white shadow-sm h-full">
      <CardContent className="px-2 pt-1.5 pb-1.5 h-full flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('rounded-full p-1.5 shrink-0', iconBg)}>
            <Icon className={cn('h-3.5 w-3.5', iconColor)} />
          </div>
          <p className="text-xs font-extrabold text-slate-800 tracking-tight truncate">{title}</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative mt-2">
          {total > 0 ? (
            <div className="relative w-full" style={{ height: '100%', minHeight: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="68%"
                    outerRadius="88%"
                    cornerRadius={0}
                    paddingAngle={2}
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
                <span className="text-3xl font-extrabold tabular-nums text-slate-800">{displayValue}</span>
                {centerLabel && <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 mt-0.5">{centerLabel}</span>}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No data</p>
          )}
        </div>
        {/* Horizontal Legend */}
        <div className="flex flex-col w-full gap-y-0.5 mt-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate">{d.name}</span>
              </span>
              <span className="font-bold tabular-nums text-slate-800">{d.value}</span>
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
  className?: string
}

function RankedListCard({ title, icon: Icon, items, colorPool = CONTRACTOR_COLORS, className }: RankedListCardProps) {
  const maxVal = Math.max(...items.map(d => d.value), 1)
  return (
    <Card className={cn('overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-[16px] p-3.5 flex flex-col h-full', className)}>
      <CardHeader className="p-0 mb-4 shrink-0 border-b-0 space-y-0">
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-500/15 p-2.5 shrink-0">
              <Icon className="h-5 w-5 text-violet-600" />
            </div>
            <div className="min-w-0">
              <CardTitle className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{title}</CardTitle>
            </div>
          </div>
          <div className="h-7 w-7 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0 ml-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">{items.length}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <div className="h-full">
          <div className="space-y-1.5">
            {items.length === 0 ? (
              <p className="text-xs text-slate-400">No data available</p>
            ) : (
              items.map((item, idx) => {
                const pct = (item.value / maxVal) * 100
                const color = colorPool[idx % colorPool.length]
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-8 shrink-0 text-[11px] font-bold text-slate-400 dark:text-slate-400 truncate">
                      {item.name}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <span className="w-5 text-right font-extrabold text-[13px] text-slate-900 dark:text-slate-100 tabular-nums">
                      {item.value}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
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
    <Card className={cn('overflow-hidden border-teal-100/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-[16px] p-3.5 h-full flex flex-col', className)}>
      <CardHeader className="p-0 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-gradient-to-br from-teal-500/15 to-cyan-500/15 p-1.5">
            <Icon className="h-3.5 w-3.5 text-teal-600" />
          </div>
          <CardTitle className="text-sm font-extrabold text-slate-700 dark:text-slate-100">{title}</CardTitle>
          <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500">{data.length} records</span>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="w-full h-[220px]">
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
function ActivityCard({ className, slides = [] }: { className?: string; slides?: string[] }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const defaultSlides = ['/slideshow/slide1.jpg', '/slideshow/slide2.jpg', '/slideshow/slide3.jpg']
  const displaySlides = slides.length > 0 ? slides : defaultSlides

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(s => (s + 1) % displaySlides.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [displaySlides.length])

  return (
    <Card className={cn('overflow-hidden border-teal-100/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col', className)}>
      <CardContent className="px-2 py-2 flex-1 min-h-0 flex flex-col">
        <div className="relative flex-1 w-full min-h-[200px] overflow-hidden bg-slate-100 rounded-xl">
          <AnimatePresence initial={false}>
            <motion.img
              key={currentSlide}
              src={displaySlides[currentSlide]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full object-cover"
              alt="Activity Photo"
            />
          </AnimatePresence>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
            {displaySlides.map((_, i) => (
              <div
                key={i}
                className={cn('h-1.5 rounded-full transition-all', i === currentSlide ? 'w-4 bg-teal-500' : 'w-1.5 bg-white/70')}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

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
  const date = new Date(item.timestamp)
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(' ', '')
  const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const locParts = (item.location || '').split('•')
  const locStr = locParts.length > 1 ? locParts[1].trim() : (item.location || 'Unknown Location')
  const actor = item.title.startsWith('INC-') ? 'System' : item.title

  let actionText = ''
  if (item.kind === 'photo') actionText = `photo uploaded in ${locStr}, by ${actor}`
  else if (item.kind === 'entry') actionText = `worker registered in ${locStr}, by ${actor}`
  else if (item.kind === 'medical') actionText = `medical test completed in ${locStr}, by ${actor}`
  else if (item.kind === 'training') actionText = `training attended in ${locStr}, by ${actor}`
  else if (item.kind === 'incident') actionText = `incident reported in ${locStr}, by ${actor}`
  else actionText = `activity recorded in ${locStr}, by ${actor}`

  return (
    <div className="flex items-start gap-3 px-2 py-0.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-default">
      <button
        onClick={() => onPhotoClick?.(item)}
        className="shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-300 rounded-md mt-0.5"
        title={item.photo ? 'Click to view photo' : 'No photo'}
      >
        <ActivityPhoto photo={item.photo} name={item.title} />
      </button>
      <div className="flex-1 min-w-0 flex items-center h-full pt-1">
        <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
          {actionText} at <span className="font-semibold text-slate-900 dark:text-slate-100">{timeString} {dateString}</span>
        </p>
      </div>
    </div>
  )
}

// ──────────────────── Loading Skeleton ────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-2 h-full">
      <div className="space-y-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3 w-72" />
      </div>
      <div className="flex-1 grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="rounded-xl" />
        ))}
      </div>
      <div className="flex-1 grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="rounded-xl" />
        ))}
      </div>
      <div className="flex-1 grid grid-cols-4 gap-2">
        <Skeleton className="rounded-xl" />
        <Skeleton className="col-span-3 rounded-xl" />
      </div>
    </div>
  )
}

// ──────────────────── Main Component ────────────────────

export default function DashboardView() {
  const setPage = useNavStore(s => s.setPage)
  const openWorkerForm = useNavStore(s => s.openWorkerForm)
  const openIncidentForm = useNavStore(s => s.openIncidentForm)
  const mobileViewConfig = useNavStore(s => s.mobileView)
  const isDeviceMobile = useIsMobile()
  const isMobile = isDeviceMobile || !!mobileViewConfig
  const [activeTab, setActiveTab] = useState<'photos' | 'new-entry' | 'medical' | 'training' | 'incident'>('new-entry')
  const [previewPhoto, setPreviewPhoto] = useState<ActivityItem | null>(null)

  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [contractorFilter, setContractorFilter] = useState('all')
  const [campFilter, setCampFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')

  const hasActiveFilters = !!dateRange || contractorFilter !== 'all' || campFilter !== 'all' || projectFilter !== 'all'
  const clearFilters = () => {
    setDateRange(undefined)
    setContractorFilter('all')
    setCampFilter('all')
    setProjectFilter('all')
  }

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
  const campsPerContractorData = [
    { name: 'BSR', value: 7 },
    { name: 'NCC', value: 11 },
    { name: 'L&T', value: 5 },
    { name: 'MEIL', value: 9 },
    { name: 'RVR', value: 6 },
    { name: 'AVR', value: 8 },
    { name: 'GMR', value: 4 },
    { name: 'SEC', value: 10 },
    { name: 'JKC', value: 3 },
    { name: 'SPC', value: 12 },
    { name: 'DVR', value: 2 },
  ]

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
    { id: 'new-entry' as const, label: 'New Entry' },
    { id: 'medical' as const, label: 'Medical' },
    { id: 'training' as const, label: 'Training' },
    { id: 'incident' as const, label: 'Incident' },
    { id: 'photos' as const, label: 'Photos' },
  ]

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      {/* ────── Hero Header and Filters ────── */}
      <div className={cn("shrink-0 flex gap-4", isMobile ? "flex-col" : "items-center justify-between")}>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={cn(
            "rounded-xl bg-gradient-to-r from-teal-50 via-cyan-50/80 to-teal-50/60 border border-teal-100/60 dark:from-teal-950/40 dark:via-cyan-900/20 dark:to-teal-950/30 dark:border-teal-900/50 px-4 py-2 flex items-center justify-between",
            isMobile ? "w-full" : "w-1/2"
          )}
        >
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-800 dark:text-slate-100">{getGreeting()} 👋</h1>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {getTodayFormatted()}
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <div className={cn("gap-2", isMobile ? "grid grid-cols-2" : "flex flex-wrap items-center justify-end")}>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 px-3 text-xs font-medium rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors",
                isMobile && "col-span-2"
              )}
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full px-4 h-9 rounded-full justify-start text-left font-medium text-xs bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all overflow-hidden text-ellipsis whitespace-nowrap",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarDays className="mr-2 h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  <span>Date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl flex" align="start">
              {/* Quick Presets Sidebar */}
              <div className="flex flex-col gap-1 border-r border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/50 w-[140px]">
                <span className="text-xs font-semibold text-slate-500 mb-1 px-2">Quick Select</span>
                {[
                  { label: 'Overall', onClick: () => setDateRange(undefined) },
                  { label: 'Today', onClick: () => setDateRange({ from: new Date(), to: new Date() }) },
                  { label: 'Yesterday', onClick: () => setDateRange({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
                  { label: 'Last 7 Days', onClick: () => setDateRange({ from: subDays(new Date(), 6), to: new Date() }) },
                  { label: 'Last 30 Days', onClick: () => setDateRange({ from: subDays(new Date(), 29), to: new Date() }) },
                ].map(preset => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="justify-start font-normal text-xs h-8 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                    onClick={preset.onClick}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              {/* Calendar */}
              <div className="p-2">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  className="bg-white dark:bg-slate-950 rounded-xl"
                />
              </div>
            </PopoverContent>
          </Popover>
          <Select value={contractorFilter} onValueChange={setContractorFilter}>
            <SelectTrigger className="w-full px-4 h-9 rounded-full text-xs font-medium bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all overflow-hidden">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <HardHat className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <SelectValue placeholder="Contractor" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg border-slate-200 dark:border-slate-800">
              <SelectItem value="all" className="text-xs cursor-pointer">All Contractors</SelectItem>
              <SelectItem value="lnt" className="text-xs cursor-pointer">L&T Construction</SelectItem>
              <SelectItem value="ncc" className="text-xs cursor-pointer">NCC Limited</SelectItem>
            </SelectContent>
          </Select>
          <Select value={campFilter} onValueChange={setCampFilter}>
            <SelectTrigger className="w-full px-4 h-9 rounded-full text-xs font-medium bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all overflow-hidden">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Tent className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <SelectValue placeholder="Camp" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg border-slate-200 dark:border-slate-800">
              <SelectItem value="all" className="text-xs cursor-pointer">All Camps</SelectItem>
              <SelectItem value="camp-a" className="text-xs cursor-pointer">Camp A</SelectItem>
              <SelectItem value="camp-b" className="text-xs cursor-pointer">Camp B</SelectItem>
            </SelectContent>
          </Select>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full px-4 h-9 rounded-full text-xs font-medium bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all overflow-hidden">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <FolderKanban className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <SelectValue placeholder="Project" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-lg border-slate-200 dark:border-slate-800">
              <SelectItem value="all" className="text-xs cursor-pointer">All Projects</SelectItem>
              <SelectItem value="zone7" className="text-xs cursor-pointer">Zone 7</SelectItem>
              <SelectItem value="zone9" className="text-xs cursor-pointer">Zone 9</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ────── Main Content: CSS Grid — unified layout ────── */}
      <div
        className={cn("flex-1 min-h-0 px-2 pt-2 pb-0 -mx-2 -mt-2", isMobile ? "flex flex-col gap-4 overflow-y-auto" : "grid")}
        style={isMobile ? {} : {
          gridTemplateColumns: '1fr 372px',
          gridTemplateRows: 'minmax(0, 0.67fr) minmax(0, 0.67fr) minmax(0, 0.78fr)',
          gap: '6px 8px',
        }}
      >
        {/* Row 1: 5 KPI cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className={cn("min-h-0", isMobile ? "flex flex-col gap-2" : "grid")}
          style={isMobile ? {} : { gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', gridColumn: '1', gridRow: '1' }}
        >
          <StatCard title="Total Workforce" icon={Users} iconBg="bg-teal-500" iconColor="text-white" bigNumber={String(dash.totalWorkers)} unit="workers" subtitle="Male vs. Female" segments={[{ label: 'Male', value: maleCount, color: DONUT_COLORS.male }, { label: 'Female', value: femaleCount, color: DONUT_COLORS.female }, ...(otherGender > 0 ? [{ label: 'Other', value: otherGender, color: '#94a3b8' }] : [])]} />
          <StatCard title="Skill Mix" icon={Wrench} iconBg="bg-orange-500" iconColor="text-white" bigNumber={String(dash.skilledWorkers + dash.unskilledWorkers)} unit="workers" subtitle="Skilled vs Unskilled" segments={[{ label: 'Skilled', value: dash.skilledWorkers, color: DONUT_COLORS.skilled }, { label: 'Unskilled', value: dash.unskilledWorkers, color: DONUT_COLORS.unskilled }]} />
          <StatCard title="Age Distribution" icon={Activity} iconBg="bg-purple-500" iconColor="text-white" bigNumber={String(dash.totalWorkers)} unit="workers" subtitle="Workforce by age band" segments={(dash.ageDistribution ?? []).map((a, i) => ({ label: a.bucket, value: a.count, color: [DONUT_COLORS.age1, DONUT_COLORS.age2, DONUT_COLORS.age3, DONUT_COLORS.age4][i] || '#94a3b8' }))} />
          <StatCard title="Medical Tests" icon={HeartPulse} iconBg="bg-emerald-500" iconColor="text-white" bigNumber={String(medFit + medUnfit + medPending + medConditional)} unit="tests" subtitle="Fitness outcome" segments={[{ label: 'Fit', value: medFit, color: DONUT_COLORS.medicalFit }, { label: 'Unfit', value: medUnfit, color: DONUT_COLORS.medicalUnfit }, { label: 'Conditional', value: medConditional, color: DONUT_COLORS.medicalConditional }].filter(s => s.value > 0)} />
          <StatCard title="Training Status" icon={GraduationCap} iconBg="bg-orange-500" iconColor="text-white" bigNumber={String(trainingTotal)} unit="certificates" subtitle="Certificate validity" segments={[{ label: 'Valid', value: trainingValid, color: DONUT_COLORS.trainingValid }, { label: 'Expiring Soon', value: trainingExpiring, color: DONUT_COLORS.trainingExpiring }, { label: 'Expired', value: trainingExpired, color: DONUT_COLORS.trainingExpired }].filter(s => s.value > 0)} />
        </motion.div>

        {/* Row 2: 4 Donut chart cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={cn("min-h-0", isMobile ? "flex flex-col gap-2" : "grid")}
          style={isMobile ? {} : { gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', gridColumn: '1', gridRow: '2' }}
        >
          <StatCard
            title="Equipment Status"
            icon={Wrench}
            iconBg="bg-orange-500"
            iconColor="text-white"
            bigNumber={String(equipmentData.reduce((s, d) => s + d.value, 0))}
            unit="items"
            subtitle="Condition breakdown"
            segments={equipmentData.map(d => ({ label: d.name, value: d.value, color: d.color }))}
          />
          <StatCard
            title="Inspection Status"
            icon={ShieldCheck}
            iconBg="bg-orange-500"
            iconColor="text-white"
            bigNumber={String(inspectionData.reduce((s, d) => s + d.value, 0))}
            unit="inspections"
            subtitle="Pass / Fail rates"
            segments={inspectionData.map(d => ({ label: d.name, value: d.value, color: d.color }))}
          />
          <StatCard
            title="Ownership"
            icon={Building2}
            iconBg="bg-orange-500"
            iconColor="text-white"
            bigNumber={String(ownershipData.reduce((s, d) => s + d.value, 0))}
            unit="assets"
            subtitle="Own vs Rented"
            segments={ownershipData.map(d => ({ label: d.name, value: d.value, color: d.color }))}
          />
          <StatCard
            title="Approval Status"
            icon={CheckCircle2}
            iconBg="bg-orange-500"
            iconColor="text-white"
            bigNumber="100"
            unit="% approved"
            subtitle="Clearance rate"
            segments={[
              { label: 'Approved', value: 100, color: DONUT_COLORS.approved },
              { label: 'Pending', value: 0, color: DONUT_COLORS.pendingApproval }
            ]}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className={cn("min-h-0", isMobile ? "flex flex-col gap-2" : "grid")}
          style={isMobile ? {} : { gridTemplateColumns: '322px 1fr', gap: '8px', gridColumn: '1', gridRow: '3' }}
        >
          <RankedListCard className={cn(isMobile && "min-h-[250px]")} title="Camps per Contractor" icon={Building2} items={campsPerContractorData} colorPool={['#8b5cf6', '#ec4899', '#0ea5e9', '#eab308', '#f97316', '#14b8a6', '#94a3b8']} />
          <BarChartCard className={cn(isMobile && "min-h-[300px]")} title="Workforce per Camp" icon={Users} data={workforcePerCampData} maxBarSize={10} />
        </motion.div>

        {/* RIGHT PANEL - Row 1 and 2: Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className={cn("flex flex-col h-full min-h-0", isMobile && "min-h-[400px]")}
          style={isMobile ? {} : { gridColumn: '2', gridRow: '1 / span 2' }}
        >
          <Card className="w-full flex-1 min-h-0 overflow-hidden border-teal-100/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-[16px] p-3.5 flex flex-col gap-1.5">
            <CardHeader className="p-0 space-y-0 shrink-0">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-gradient-to-br from-teal-500/15 to-cyan-500/15 p-1.5">
                  <Activity className="h-3.5 w-3.5 text-teal-600" />
                </div>
                <CardTitle className="text-sm font-extrabold text-slate-700 dark:text-slate-100">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-1.5 flex-1 min-h-0 flex flex-col">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 min-h-0 flex flex-col">
                <TabsList className="w-full flex gap-1 bg-slate-100/70 dark:bg-slate-800/70 p-1 shrink-0 h-auto mb-0 mt-0">
                  {tabs.map(t => (
                    <TabsTrigger key={t.id} value={t.id} className={cn('flex-1 text-[10px] py-1.5 rounded-md font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 data-[state=active]:shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300')}>{t.label}</TabsTrigger>
                  ))}
                </TabsList>
                {tabs.map(t => (
                  <TabsContent key={t.id} value={t.id} className="mt-0 flex-1 min-h-0">
                    <ScrollArea className="h-full pr-1">
                      <div className="space-y-0.5">
                        {activityItems.length === 0 ? (
                          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">No recent activity</p>
                        ) : (
                          <AnimatePresence mode="popLayout">
                            {activityItems.map((item) => (
                              <motion.div key={item.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>
                                <RecentActivityItem item={item} onPhotoClick={item.photo ? () => setPreviewPhoto(item) : undefined} />
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

        {/* RIGHT PANEL - Row 3: ActivityCard (Photos) */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={cn("flex flex-col h-full min-h-0", isMobile && "min-h-[250px]")}
          style={isMobile ? {} : { gridColumn: '2', gridRow: '3' }}
        >
          <ActivityCard className="w-full h-full" slides={activityItems.map(i => i.photo).filter(Boolean) as string[]} />
        </motion.div>
      </div>

      {/* Quick Actions — 5 buttons, ~55px high */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="shrink-0"
      >
        <div className={cn("w-full", isMobile ? "grid grid-cols-2 gap-2 pb-2" : "grid grid-cols-5 gap-3")}>
          {[
            { icon: UserPlus, label: 'Register Worker', action: 'worker-form' as const, bg: 'bg-teal-500' },
            { icon: FileWarning, label: 'Log Incident', action: 'incident-form' as const, bg: 'bg-rose-500' },
            { icon: ClipboardCheck, label: 'Mark Attendance', action: 'attendance' as const, bg: 'bg-emerald-500' },
            { icon: UserCog, label: 'View Workers', action: 'workers' as const, bg: 'bg-purple-500' },
            { icon: Search, label: 'Search Machinery', action: 'vehicles' as const, bg: 'bg-blue-500' },
          ].map((action, index) => (
            <Button
              key={action.action}
              variant="outline"
              className={cn(
                "h-[50px] flex-row justify-start gap-3 px-4 group/qa transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-slate-200 bg-white rounded-full relative w-full",
                isMobile && index === 4 && "col-span-2"
              )}
              onClick={() => {
                if (action.action === 'worker-form') openWorkerForm()
                else if (action.action === 'incident-form') openIncidentForm()
                else setPage(action.action)
              }}
            >
              <div className={cn('rounded-full p-1.5 text-white shadow-sm shrink-0', action.bg)}>
                <action.icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">{action.label}</span>
            </Button>
          ))}
        </div>
      </motion.div>

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
