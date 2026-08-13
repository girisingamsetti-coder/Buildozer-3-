'use client'

import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  MessageSquareWarning,
  UserPlus,
  FileWarning,
  ClipboardCheck,
  UserCog,
  Bell,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Clock,
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
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useNavStore } from '@/stores/nav-store'
import { useAuthStore } from '@/lib/auth-store'
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
}

interface Notification {
  id: string
  title: string
  message: string
  priority: string
  createdAt: string
}

interface AttendanceTrendPoint {
  date: string
  label: string
  present: number
  absent: number
  total: number
}

// ──────────────────── Color Palette ────────────────────

const TEAL = '#0d9488'
const TEAL_LIGHT = '#5eead4'
const AMBER = '#f59e0b'
const AMBER_LIGHT = '#fcd34d'
const RED = '#ef4444'
const RED_LIGHT = '#fca5a5'
const EMERALD = '#10b981'
const SLATE = '#64748b'

const GENDER_COLORS: Record<string, string> = {
  Male: TEAL,
  Female: '#f472b6',
  Other: SLATE,
}

const TRAINING_COLORS: Record<string, string> = {
  Valid: EMERALD,
  ExpiringSoon: AMBER,
  Expired: RED,
}

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-red-500 ring-2 ring-red-200 dark:ring-red-800',
  high: 'bg-amber-500 ring-2 ring-amber-200 dark:ring-amber-800',
  medium: 'bg-teal-500',
  low: 'bg-slate-400',
  info: 'bg-teal-500',
}

// ──────────────────── Animations ────────────────────

const stagger = {
  container: {
    animate: { transition: { staggerChildren: 0.06 } },
  },
  item: {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  },
}

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

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

// ──────────────────── Gradient Backgrounds for Stat Tiles ────────────────────

const TILE_GRADIENTS = [
  // Total Workforce - teal gradient
  'from-teal-500/10 via-teal-500/5 to-transparent border-teal-200/60 dark:border-teal-700/40',
  // Attendance - emerald gradient
  'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200/60 dark:border-emerald-700/40',
  // Expiring Trainings - amber gradient
  'from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/60 dark:border-amber-700/40',
  // Open Incidents - red gradient
  'from-red-500/10 via-red-500/5 to-transparent border-red-200/60 dark:border-red-700/40',
  // Pending Medical - orange gradient
  'from-orange-500/10 via-orange-500/5 to-transparent border-orange-200/60 dark:border-orange-700/40',
  // Open Grievances - rose gradient
  'from-rose-500/10 via-rose-500/5 to-transparent border-rose-200/60 dark:border-rose-700/40',
  // Compliance - emerald gradient
  'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200/60 dark:border-emerald-700/40',
  // Safety Score - cyan gradient
  'from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-200/60 dark:border-cyan-700/40',
]

const TILE_ICON_STYLES = [
  'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'bg-red-500/15 text-red-600 dark:text-red-400',
  'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
]

// ──────────────────── Stat Tile Component ────────────────────

interface StatTileProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  index: number
  onClick?: () => void
  pulse?: boolean
  trend?: 'up' | 'down'
  trendValue?: string
}

function StatTile({ title, value, subtitle, icon: Icon, index, onClick, pulse, trend, trendValue }: StatTileProps) {
  return (
    <motion.div variants={stagger.item} className="h-full">
      <Card
        className={cn(
          'group relative overflow-hidden cursor-pointer h-full',
          'bg-gradient-to-br transition-all duration-300 ease-out',
          TILE_GRADIENTS[index % TILE_GRADIENTS.length],
          'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
          'hover:-translate-y-1 hover:scale-[1.02]',
          'active:translate-y-0 active:scale-[0.99]',
          'border backdrop-blur-sm',
        )}
        onClick={onClick}
      >
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardContent className="relative p-4 sm:p-5 h-full flex flex-col">
          <div className="flex items-start justify-between flex-1 min-h-0">
            <div className="space-y-1.5 min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 line-clamp-1">{title}</p>
              <div className="flex items-baseline gap-2 min-h-[1.875rem] sm:min-h-[2.25rem]">
                <p className="text-xl sm:text-3xl font-bold tracking-tight tabular-nums leading-none whitespace-nowrap overflow-hidden">{value}</p>
                {trend && trendValue && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={cn(
                      'inline-flex items-center gap-0.5 text-xs font-semibold rounded-full px-1.5 py-0.5 shrink-0',
                      trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    )}
                  >
                    {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {trendValue}
                  </motion.span>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 min-h-[1rem]">{subtitle || '\u00A0'}</p>
            </div>
            <div className={cn('relative rounded-xl p-2.5 shrink-0 transition-transform duration-300 group-hover:scale-110', TILE_ICON_STYLES[index % TILE_ICON_STYLES.length])}>
              <Icon className="h-5 w-5" />
              {pulse && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
              )}
            </div>
          </div>

          {/* Bottom shimmer on hover */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400/0 to-transparent group-hover:via-teal-400/60 transition-all duration-500" />
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ──────────────────── Custom Chart Tooltip ────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-background/95 backdrop-blur-sm px-3.5 py-2.5 shadow-xl">
      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground capitalize">{entry.name}:</span>
          <span className="font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

// ──────────────────── Loading Skeleton ────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div className="space-y-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      {/* Row 1: 4 tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4 sm:p-5"><div className="flex items-start justify-between"><div className="space-y-2 flex-1"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-20" /></div><Skeleton className="h-10 w-10 rounded-xl" /></div></CardContent></Card>
        ))}
      </div>
      {/* Row 2: 4 tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4 sm:p-5"><div className="flex items-start justify-between"><div className="space-y-2 flex-1"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-20" /></div><Skeleton className="h-10 w-10 rounded-xl" /></div></CardContent></Card>
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2"><CardHeader><Skeleton className="h-5 w-40" /></CardHeader><CardContent><Skeleton className="h-72 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-5 w-40" /></CardHeader><CardContent><Skeleton className="h-72 w-full" /></CardContent></Card>
      </div>
      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card><CardHeader><Skeleton className="h-5 w-36" /></CardHeader><CardContent><Skeleton className="h-52 w-full" /></CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><Skeleton className="h-5 w-36" /></CardHeader><CardContent><Skeleton className="h-52 w-full" /></CardContent></Card>
      </div>
    </div>
  )
}

// ──────────────────── Incident Label Map ────────────────────

const INCIDENT_LABEL_MAP: Record<string, string> = {
  MinorInjury: 'Minor Injury',
  MajorFatalInjury: 'Major / Fatal',
  NearMiss: 'Near Miss',
  PropertyDamage: 'Property Damage',
  Environmental: 'Environmental',
  FireInjury: 'Fire Injury',
  Fire: 'Fire',
  Death: 'Death',
}

const INCIDENT_COLORS = ['#0d9488', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#64748b']

// ──────────────────── Main Component ────────────────────

export default function DashboardView() {
  const role = useAuthStore(s => s.role)
  const setPage = useNavStore(s => s.setPage)
  const openWorkerForm = useNavStore(s => s.openWorkerForm)
  const openIncidentForm = useNavStore(s => s.openIncidentForm)

  const { data: dash, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then(r => r.json()),
  })

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => fetch('/api/notifications').then(r => r.json()),
  })

  const { data: attendanceTrend } = useQuery<AttendanceTrendPoint[]>({
    queryKey: ['dashboard', 'attendance-trend'],
    queryFn: () => fetch('/api/dashboard/attendance-trend').then(r => r.json()),
  })

  if (isLoading) return <DashboardSkeleton />
  if (!dash) return null

  // Compute training valid percentage for center text
  const trainingTotal = dash.trainingStatusBreakdown?.reduce((s, t) => s + t.count, 0) ?? 0
  const trainingValid = dash.trainingStatusBreakdown?.find(t => t.status === 'Valid')?.count ?? 0
  const trainingValidPct = trainingTotal > 0 ? Math.round((trainingValid / trainingTotal) * 100) : 0

  const incidentData = (dash.incidentBreakdown ?? []).map(d => ({
    ...d,
    label: INCIDENT_LABEL_MAP[d.type] || d.type,
  }))

  const trainingData = dash.trainingStatusBreakdown ?? []
  const genderData = dash.genderBreakdown ?? []
  const recentAlerts = (notifications ?? []).slice(0, 6)

  // Count total gender
  const genderTotal = genderData.reduce((s, g) => s + g.count, 0)

  return (
    <div className="space-y-4">
      {/* ────── Greeting ────── */}
      <motion.div {...fadeIn}>
        <h1 className="text-2xl font-bold tracking-tight">{getGreeting()} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{getTodayFormatted()} — Here's your site overview</p>
      </motion.div>

      {/* ────── Stat Tiles ────── */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger.container} initial="initial" animate="animate">
        <StatTile
          title="Total Workforce"
          value={`${dash.activeWorkers} / ${dash.totalWorkers}`}
          subtitle={`${dash.totalWorkers - dash.activeWorkers} inactive`}
          icon={Users}
          index={0}
          onClick={() => setPage('workers')}
        />
        <StatTile
          title="Open Incidents"
          value={dash.openIncidentsCount}
          subtitle="require immediate attention"
          icon={AlertTriangle}
          index={3}
          onClick={() => setPage('incidents')}
          pulse={dash.openIncidentsCount > 0}
        />
        <StatTile
          title="Open Grievances"
          value={dash.openGrievancesCount}
          subtitle="awaiting resolution"
          icon={MessageSquareWarning}
          index={5}
          onClick={() => setPage('grievance')}
          pulse={dash.openGrievancesCount > 0}
        />
      </motion.div>

      {/* ────── Charts Row 1: Attendance Trend (2/3) + Training Donut (1/3) ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Trend - Area Chart */}
        <motion.div className="lg:col-span-2" {...fadeIn} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Attendance Trend</CardTitle>
                  <CardDescription>Last 7 days daily attendance</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-normal">
                  <Activity className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {attendanceTrend && attendanceTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={TEAL} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={TEAL} stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={RED} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={RED} stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="present"
                      name="Present"
                      stroke={TEAL}
                      strokeWidth={2.5}
                      fill="url(#presentGradient)"
                      dot={{ fill: TEAL, strokeWidth: 0, r: 3 }}
                      activeDot={{ fill: TEAL, strokeWidth: 2, stroke: '#fff', r: 5 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="absent"
                      name="Absent"
                      stroke={RED}
                      strokeWidth={2}
                      fill="url(#absentGradient)"
                      strokeDasharray="5 5"
                      dot={{ fill: RED, strokeWidth: 0, r: 2.5 }}
                      activeDot={{ fill: RED, strokeWidth: 2, stroke: '#fff', r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-72 text-muted-foreground text-sm">
                  <CalendarCheck className="h-4 w-4 mr-2" /> No attendance data for the past week
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Training Compliance - Donut Chart with Center Text */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Training Compliance</CardTitle>
              <CardDescription>Certification status</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              {trainingData.length > 0 ? (
                <>
                  <div className="relative">
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          data={trainingData}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          innerRadius={56}
                          outerRadius={82}
                          paddingAngle={4}
                          strokeWidth={0}
                          animationBegin={300}
                          animationDuration={800}
                        >
                          {trainingData.map((entry, idx) => (
                            <Cell
                              key={entry.status}
                              fill={TRAINING_COLORS[entry.status] || SLATE}
                              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center text overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold">{trainingValidPct}%</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Valid</span>
                    </div>
                  </div>

                  {/* Legend below the donut */}
                  <div className="mt-3 w-full space-y-2">
                    {trainingData.map((entry) => {
                      const color = TRAINING_COLORS[entry.status] || SLATE
                      const label = entry.status === 'ExpiringSoon' ? 'Expiring Soon' : entry.status
                      const pct = trainingTotal > 0 ? Math.round((entry.count / trainingTotal) * 100) : 0
                      return (
                        <div key={entry.status} className="flex items-center gap-2.5 text-sm">
                          <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="flex-1 text-muted-foreground">{label}</span>
                          <span className="font-semibold tabular-nums">{entry.count}</span>
                          <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                  No training data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ────── Charts Row 2: Demographics (1/3) + Incident (1/3) + Alerts (1/3) ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Workforce Demographics - Donut */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.25 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Workforce Demographics</CardTitle>
              <CardDescription>Gender distribution</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {genderData.length > 0 ? (
                <>
                  <div className="relative mx-auto w-fit">
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={genderData}
                          dataKey="count"
                          nameKey="gender"
                          cx="50%"
                          cy="50%"
                          innerRadius={54}
                          outerRadius={76}
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {genderData.map((entry) => (
                            <Cell key={entry.gender} fill={GENDER_COLORS[entry.gender] || SLATE} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold">{genderTotal}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</span>
                    </div>
                  </div>
                  <div className="mt-3 w-full space-y-2">
                    {genderData.map((entry) => {
                      const color = GENDER_COLORS[entry.gender] || SLATE
                      const pct = genderTotal > 0 ? Math.round((entry.count / genderTotal) * 100) : 0
                      return (
                        <div key={entry.gender} className="flex items-center gap-2.5 text-sm">
                          <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="flex-1 text-muted-foreground">{entry.gender}</span>
                          <span className="font-semibold tabular-nums">{entry.count}</span>
                          <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">No data</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Incident Breakdown - Gradient Bar Chart */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Incident Summary</CardTitle>
                  <CardDescription>Breakdown by type</CardDescription>
                </div>
                {dash.openIncidentsCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {dash.openIncidentsCount} Open
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {incidentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={incidentData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barCategoryGap="20%">
                    <defs>
                      {incidentData.map((_, idx) => (
                        <linearGradient key={idx} id={`barGrad${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={INCIDENT_COLORS[idx % INCIDENT_COLORS.length]} stopOpacity={1} />
                          <stop offset="100%" stopColor={INCIDENT_COLORS[idx % INCIDENT_COLORS.length]} stopOpacity={0.6} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))', radius: 4, opacity: 0.5 }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={52} animationDuration={800}>
                      {incidentData.map((_, idx) => (
                        <Cell key={idx} fill={`url(#barGrad${idx})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" /> No incidents recorded
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Alerts */}
        <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.35 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Recent Alerts</CardTitle>
                  <CardDescription>Latest notifications</CardDescription>
                </div>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentAlerts.length > 0 ? (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  <AnimatePresence>
                    {recentAlerts.map((n, idx) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        className="flex items-start gap-2.5 group/alert"
                      >
                        <span className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0 transition-transform group-hover/alert:scale-125', PRIORITY_STYLES[n.priority] || 'bg-slate-400')} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-tight truncate group-hover/alert:text-foreground transition-colors">{n.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                          {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-xs">
                  <Bell className="h-3.5 w-3.5 mr-1.5" /> No recent notifications
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ────── Quick Actions ────── */}
      <motion.div {...fadeIn} transition={{ duration: 0.4, delay: 0.4 }}>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: UserPlus, label: 'Register Worker', action: 'worker-form' as const, color: 'text-teal-600 dark:text-teal-400' },
            { icon: FileWarning, label: 'Log Incident', action: 'incident-form' as const, color: 'text-red-600 dark:text-red-400' },
            { icon: ClipboardCheck, label: 'Mark Attendance', action: 'attendance' as const, color: 'text-emerald-600 dark:text-emerald-400' },
            { icon: UserCog, label: 'View Workers', action: 'workers' as const, color: 'text-cyan-600 dark:text-cyan-400' },
          ].map((action) => (
            <Button
              key={action.action}
              variant="outline"
              className="h-auto flex-col gap-2.5 py-4 px-3 group/qa transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              onClick={() => {
                if (action.action === 'worker-form') openWorkerForm()
                else if (action.action === 'incident-form') openIncidentForm()
                else setPage(action.action)
              }}
            >
              <action.icon className={cn('h-5 w-5 transition-transform duration-200 group-hover/qa:scale-110', action.color)} />
              <span className="text-xs font-medium">{action.label}</span>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover/qa:opacity-100 transition-opacity duration-200 absolute top-2 right-2" />
            </Button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
