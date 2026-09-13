'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Download, ChevronLeft, ChevronRight, ClipboardCheck, Search, Users, UserCheck, UserX, Clock, CheckCircle2, MoreVertical, X, CheckSquare, Settings2, MousePointerClick, Coffee, Loader2, HardHat, Briefcase, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuthStore, rolePermissions } from '@/stores/auth-store'
import { useNavStore } from '@/stores/nav-store'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { TableExportButton, type ExportColumn } from '@/components/ui/table-export-button'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isSunday,
  parseISO,
} from 'date-fns'

// ---------- types ----------
interface Worker {
  id: string
  employeeNumber: string
  fullName: string
  isActive: boolean
  designation: { name: string }
  contractor?: { id: string; name: string; code: string }
  site?: { id: string; name: string; code: string } | null
  labourCamp?: { id: string; name: string } | null
}

interface WorkersResponse {
  data: Worker[]
  total: number
}

interface AttendanceRecord {
  id: string
  workerId: string
  employeeNumber?: string | null
  date: string
  status?: string
  shift?: string
  checkIn?: string | null
  checkOut?: string | null
  regularHours?: number | null
  overtimeHours?: number | null
  remarks?: string | null
  createdAt?: string
  updatedAt?: string
}

interface Contractor {
  id: string
  name: string
  code: string
}

interface DialogWorker extends Worker {
  contractorId: string
  siteId: string | null
  contractor: { id: string; name: string; code: string }
  site: { id: string; name: string; code: string } | null
}

const STATUS_OPTIONS = [
  { value: 'Present', label: 'Present', color: 'text-emerald-700' },
  { value: 'Absent', label: 'Absent', color: 'text-red-700' },
  { value: 'HalfDay', label: 'Half Day', color: 'text-amber-700' },
  { value: 'Leave', label: 'Leave', color: 'text-slate-500' },
  { value: 'Holiday', label: 'Holiday', color: 'text-purple-600' },
] as const

type AttendanceStatus = 'Present' | 'Absent' | 'HalfDay' | 'Leave' | 'Holiday'

// ---------- helpers ----------
function statusCellClass(status: string | null, isSundayDay: boolean) {
  if (isSundayDay) return 'bg-muted/30 text-muted-foreground'
  switch (status) {
    case 'Present': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'Absent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'HalfDay': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case 'Leave': return 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400'
    default: return 'text-muted-foreground'
  }
}

function statusLetter(status: string | null, isSundayDay: boolean) {
  if (isSundayDay) return '—'
  switch (status) {
    case 'Present': return 'P'
    case 'Absent': return 'A'
    case 'HalfDay': return 'H'
    case 'Leave': return 'L'
    default: return '—'
  }
}

function dayName(dayIndex: number): string {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  return days[dayIndex] ?? ''
}

const PMC_OPTIONS = ['Aarvee', 'Nippon Koei', 'TUV', 'Typsa', 'Feedback', 'Tractbel']

function getPMCForWorker(workerId: string) {
  let hash = 0
  for (let i = 0; i < workerId.length; i++) {
    hash = workerId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PMC_OPTIONS[Math.abs(hash) % PMC_OPTIONS.length]
}


// ---------- skeleton ----------
function AttendanceTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4">
          <Skeleton className="h-4 w-36" />
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, j) => (
              <Skeleton key={j} className="h-7 w-7" />
            ))}
          </div>
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  )
}

// ---------- main component ----------
export default function AttendanceView() {
  const role = useAuthStore((s) => s.role)
  const perms = rolePermissions[role]
  const isDeviceMobile = useIsMobile()
  const mobileViewConfig = useNavStore((s) => s.mobileView)
  const isMobile = isDeviceMobile || !!mobileViewConfig
  const queryClient = useQueryClient()

  const today = new Date()
  const [viewMonth, setViewMonth] = useState<Date>(startOfMonth(today))
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [mode, setMode] = useState<'grid' | 'quick' | 'day'>('day')
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  
  const [daySearch, setDaySearch] = useState('')
  const [dayFilterStatus, setDayFilterStatus] = useState<string>('all')
  const [dayFilterContractor, setDayFilterContractor] = useState<string>('all')
  const [dayFilterPMC, setDayFilterPMC] = useState<string>('all')
  const [dayFilterLocation, setDayFilterLocation] = useState<string>('all')
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<Set<string>>(new Set())

  const monthStr = format(viewMonth, 'yyyy-MM')
  const monthLabel = format(viewMonth, 'MMMM yyyy')

  // Fetch active workers
  const { data: workersResp, isLoading: workersLoading } = useQuery<WorkersResponse>({
    queryKey: ['workers-attendance'],
    queryFn: () => fetch('/api/workers?limit=100&status=active').then((r) => r.json()),
  })
  const workers = workersResp?.data ?? []

  // Fetch attendance for all workers for the month
  const { data: attendanceMap, isLoading: attendanceLoading } = useQuery<Record<string, AttendanceRecord[]>>({
    queryKey: ['attendance-month', monthStr, workers.map(w => w.id).join(',')],
    queryFn: async () => {
      const map: Record<string, AttendanceRecord[]> = {}
      await Promise.all(
        workers.map(async (w) => {
          try {
            const resp = await fetch(`/api/workers/${w.id}/attendance?month=${monthStr}`)
            const json = await resp.json()
            map[w.id] = json.data ?? []
          } catch {
            map[w.id] = []
          }
        })
      )
      return map
    },
    enabled: workers.length > 0,
  })

  // Days of the month
  const daysInMonth = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) }),
    [viewMonth]
  )

  const isLoading = workersLoading || attendanceLoading

  // Get attendance status for a worker on a specific date
  const getStatusForDate = useCallback((
    workerId: string,
    date: Date
  ): string | null => {
    const records = attendanceMap?.[workerId] ?? []
    const found = records.find((r) => {
      const rDate = parseISO(r.date)
      return isSameDay(rDate, date)
    })
    return found?.status ?? null
  }, [attendanceMap])

  // Dynamic filter options based on current workers
  const contractorOptions = useMemo(() => {
    const set = new Set(workers.map(w => w.contractor?.name).filter(Boolean))
    return Array.from(set) as string[]
  }, [workers])

  const locationOptions = useMemo(() => {
    const set = new Set(workers.map(w => w.site?.name || w.labourCamp?.name).filter(Boolean))
    return Array.from(set) as string[]
  }, [workers])

  // Filter day view workers
  const filteredDayWorkers = useMemo(() => {
    return workers.filter((w) => {
      const searchStr = daySearch.toLowerCase()
      const matchSearch = searchStr === '' || 
        w.fullName.toLowerCase().includes(searchStr) || 
        w.employeeNumber.toLowerCase().includes(searchStr) ||
        w.contractor?.name?.toLowerCase().includes(searchStr) ||
        w.site?.name?.toLowerCase().includes(searchStr)
        
      if (!matchSearch) return false
      
      if (dayFilterStatus !== 'all') {
        const status = getStatusForDate(w.id, selectedDate)
        if (dayFilterStatus === 'Not Marked' && status) return false
        if (dayFilterStatus !== 'Not Marked' && status !== dayFilterStatus) return false
      }
      
      if (dayFilterContractor !== 'all') {
        if (w.contractor?.name !== dayFilterContractor) return false
      }
      
      if (dayFilterLocation !== 'all') {
        const loc = w.site?.name || w.labourCamp?.name
        if (loc !== dayFilterLocation) return false
      }
      
      if (dayFilterPMC !== 'all') {
        const pmc = getPMCForWorker(w.id)
        if (pmc !== dayFilterPMC) return false
      }
      
      return true
    })
  }, [workers, daySearch, dayFilterStatus, dayFilterContractor, dayFilterLocation, dayFilterPMC, selectedDate, getStatusForDate])

  // Compute summary for a worker
  const workerSummary = useCallback((workerId: string) => {
    const records = attendanceMap?.[workerId] ?? []
    let present = 0
    let absent = 0
    let halfDay = 0
    daysInMonth.forEach((day) => {
      if (isSunday(day)) return
      const status = getStatusForDate(workerId, day)
      if (status === 'Present') present++
      else if (status === 'Absent') absent++
      else if (status === 'HalfDay') halfDay++
    })
    return { present, absent, halfDay }
  }, [attendanceMap, daysInMonth, getStatusForDate])

  // Overall summary
  const overallSummary = useMemo(() => {
    let totalPresent = 0
    let totalAbsent = 0
    let totalHalfDay = 0
    let totalExpected = 0

    workers.forEach((w) => {
      const s = workerSummary(w.id)
      totalPresent += s.present
      totalAbsent += s.absent
      totalHalfDay += s.halfDay
      // Count non-Sunday days
      const nonSunDays = daysInMonth.filter((d) => !isSunday(d)).length
      totalExpected += nonSunDays
    })

    const attendancePct = totalExpected > 0
      ? Math.round(((totalPresent + totalHalfDay * 0.5) / totalExpected) * 100)
      : 0

    return { totalPresent, totalAbsent, totalHalfDay, totalExpected, attendancePct }
  }, [workers, workerSummary, daysInMonth])

  // Quick mark attendance mutation
  const markMutation = useMutation({
    mutationFn: async ({ workerId, date, status }: { workerId: string; date: string; status: string }) => {
      return fetch(`/api/workers/${workerId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, status }),
      }).then((r) => r.json())
    },
    onMutate: async ({ workerId, date, status }) => {
      const queryKey = ['attendance-month', monthStr, workers.map(w => w.id).join(',')]
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Record<string, AttendanceRecord[]>>(queryKey)
      
      queryClient.setQueryData<Record<string, AttendanceRecord[]>>(queryKey, (old) => {
        if (!old) return old
        const newMap = { ...old }
        const workerRecords = [...(newMap[workerId] || [])]
        const existingIndex = workerRecords.findIndex(r => r.date.startsWith(date))
        if (existingIndex >= 0) {
          workerRecords[existingIndex] = { ...workerRecords[existingIndex], status }
        } else {
          workerRecords.push({ 
            id: `opt-${Date.now()}`, 
            workerId, 
            date: new Date(date).toISOString(), 
            status, 
            createdAt: new Date().toISOString(), 
            updatedAt: new Date().toISOString() 
          })
        }
        newMap[workerId] = workerRecords
        return newMap
      })
      return { previous, queryKey }
    },
    onError: (err, variables, context) => {
      if (context?.previous) queryClient.setQueryData(context.queryKey, context.previous)
      toast.error('Failed to mark attendance')
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: context?.queryKey })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const handleQuickMark = (workerId: string, status: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    markMutation.mutate({ workerId, date: dateStr, status })
  }

  // Bulk mark attendance mutation
  const bulkMarkMutation = useMutation({
    mutationFn: async (status: string) => {
      const targetWorkerIds = selectedWorkerIds.size > 0 
        ? Array.from(selectedWorkerIds) 
        : filteredDayWorkers.map(w => w.id)
      
      if (targetWorkerIds.length === 0) return { marked: 0 }

      return fetch('/api/workers/bulk-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          date: format(selectedDate, 'yyyy-MM-dd'), 
          status,
          workerIds: targetWorkerIds 
        }),
      }).then((r) => r.json())
    },
    onMutate: async (status: string) => {
      const targetWorkerIds = selectedWorkerIds.size > 0 
        ? Array.from(selectedWorkerIds) 
        : filteredDayWorkers.map(w => w.id)
      const date = format(selectedDate, 'yyyy-MM-dd')
      const queryKey = ['attendance-month', monthStr, workers.map(w => w.id).join(',')]
      
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Record<string, AttendanceRecord[]>>(queryKey)
      
      queryClient.setQueryData<Record<string, AttendanceRecord[]>>(queryKey, (old) => {
        if (!old) return old
        const newMap = { ...old }
        targetWorkerIds.forEach(workerId => {
          const workerRecords = [...(newMap[workerId] || [])]
          const existingIndex = workerRecords.findIndex(r => r.date.startsWith(date))
          if (existingIndex >= 0) {
            workerRecords[existingIndex] = { ...workerRecords[existingIndex], status }
          } else {
            workerRecords.push({ 
              id: `opt-${Date.now()}-${workerId}`, 
              workerId, 
              date: new Date(date).toISOString(), 
              status, 
              createdAt: new Date().toISOString(), 
              updatedAt: new Date().toISOString() 
            })
          }
          newMap[workerId] = workerRecords
        })
        return newMap
      })
      return { previous, queryKey }
    },
    onError: (err, variables, context) => {
      if (context?.previous) queryClient.setQueryData(context.queryKey, context.previous)
      toast.error('Failed to mark bulk attendance')
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: context?.queryKey })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onSuccess: (data) => {
      setSelectedWorkerIds(new Set())
      if (data && data.marked !== undefined) {
        toast.success(`Marked ${data.marked} workers successfully`)
      }
    },
  })

  const toggleSelectAll = useCallback(() => {
    if (selectedWorkerIds.size === filteredDayWorkers.length && filteredDayWorkers.length > 0) {
      setSelectedWorkerIds(new Set())
    } else {
      setSelectedWorkerIds(new Set(filteredDayWorkers.map(w => w.id)))
    }
  }, [selectedWorkerIds, filteredDayWorkers])

  const toggleWorkerSelection = useCallback((workerId: string) => {
    setSelectedWorkerIds(prev => {
      const next = new Set(prev)
      if (next.has(workerId)) {
        next.delete(workerId)
      } else {
        next.add(workerId)
      }
      return next
    })
  }, [])

  // Grid cell click: cycle through statuses
  const handleGridCellClick = useCallback((workerId: string, day: Date) => {
    if (!perms.canEdit) return
    const currentStatus = getStatusForDate(workerId, day)
    // Cycle: null → Present → Absent → HalfDay → Leave → Present → ...
    const statusCycle = ['Present', 'Absent', 'HalfDay', 'Leave']
    let nextStatus: string
    if (!currentStatus) {
      nextStatus = 'Present'
    } else {
      const currentIndex = statusCycle.indexOf(currentStatus)
      if (currentIndex === -1) {
        nextStatus = 'Present'
      } else {
        nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length]
      }
    }
    const dateStr = format(day, 'yyyy-MM-dd')
    markMutation.mutate({ workerId, date: dateStr, status: nextStatus })
  }, [perms.canEdit, getStatusForDate, markMutation])

  const handlePrevMonth = () => {
    const newDate = new Date(viewMonth)
    newDate.setMonth(newDate.getMonth() - 1)
    setViewMonth(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(viewMonth)
    newDate.setMonth(newDate.getMonth() + 1)
    setViewMonth(newDate)
  }


  // Export columns for the monthly attendance grid (dynamic per month)
  const attendanceExportColumns = useMemo<ExportColumn<Worker>[]>(() => {
    const cols: ExportColumn<Worker>[] = [
      { key: 'fullName', header: 'Worker Name' },
      { key: 'employeeNumber', header: 'Employee No.' },
    ]
    daysInMonth.forEach((d) => {
      const dayKey = `day_${format(d, 'dd')}`
      cols.push({
        key: dayKey,
        header: format(d, 'dd MMM'),
        accessor: (row) => (isSunday(d) ? 'SUN' : statusLetter(getStatusForDate(row.id, d), false)),
      })
    })
    cols.push(
      { key: 'present', header: 'Present', accessor: (row) => workerSummary(row.id).present },
      { key: 'absent', header: 'Absent', accessor: (row) => workerSummary(row.id).absent },
      { key: 'halfDay', header: 'Half Days', accessor: (row) => workerSummary(row.id).halfDay },
    )
    return cols
  }, [daysInMonth, getStatusForDate, workerSummary])

  // Check if selectedDate is in current view month
  const isSameMonth = format(selectedDate, 'yyyy-MM') === monthStr

  return (
    <div className="space-y-6 min-w-0 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="hidden sm:block">
          <h1 className="text-2xl font-bold tracking-tight">Attendance Register</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(today, 'EEEE, dd MMMM yyyy')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={mode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className={cn(mode === 'grid' && 'bg-[#0d9488] hover:bg-[#0f766e] text-white', 'h-7')}
              onClick={() => setMode('grid')}
            >
              Monthly
            </Button>
            <Button
              variant={mode === 'day' ? 'default' : 'ghost'}
              size="sm"
              className={cn(mode === 'day' && 'bg-[#0d9488] hover:bg-[#0f766e] text-white', 'h-7')}
              onClick={() => setMode('day')}
            >
              Daily
            </Button>
          </div>

          {/* Date Picker */}
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto h-9">
                <CalendarDays className="h-4 w-4 mr-2" />
                {format(selectedDate, 'dd MMM yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => { if (d) { setSelectedDate(d); setViewMonth(startOfMonth(d)); setDatePickerOpen(false) } }}
              />
            </PopoverContent>
          </Popover>

          <TableExportButton
            rows={workers}
            columns={attendanceExportColumns}
            filename="attendance_records"
            sheetName={`Attendance ${monthStr}`}
            variant="outline"
            size="sm"
          />


        </div>
      </div>



      {/* Summary Stats */}
      {!isLoading && (
        <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-5")}>
          <Card className="h-full bg-teal-50 text-teal-700 border-teal-200 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-[0.99]">
            <CardContent className="p-3 h-full flex items-center gap-2">
              <div className="rounded-xl p-2 shrink-0 bg-teal-100 text-teal-600 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tracking-tight tabular-nums leading-tight">{workers.length}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 truncate">Workers</p>
              </div>
            </CardContent>
          </Card>
          <Card className="h-full bg-emerald-50 text-emerald-700 border-emerald-200 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-[0.99]">
            <CardContent className="p-3 h-full flex items-center gap-2">
              <div className="rounded-xl p-2 shrink-0 bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tracking-tight tabular-nums leading-tight text-emerald-700">{overallSummary.totalPresent}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 truncate">Present</p>
              </div>
            </CardContent>
          </Card>
          <Card className="h-full bg-rose-50 text-rose-700 border-rose-200 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-[0.99]">
            <CardContent className="p-3 h-full flex items-center gap-2">
              <div className="rounded-xl p-2 shrink-0 bg-rose-100 text-rose-600 flex items-center justify-center">
                <UserX className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tracking-tight tabular-nums leading-tight text-rose-700">{overallSummary.totalAbsent}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 truncate">Absent</p>
              </div>
            </CardContent>
          </Card>
          <Card className="h-full bg-amber-50 text-amber-700 border-amber-200 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-[0.99]">
            <CardContent className="p-3 h-full flex items-center gap-2">
              <div className="rounded-xl p-2 shrink-0 bg-amber-100 text-amber-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tracking-tight tabular-nums leading-tight text-amber-700">{overallSummary.totalHalfDay}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 truncate">Half Days</p>
              </div>
            </CardContent>
          </Card>
          <Card className="h-full bg-slate-50 text-slate-700 border-slate-200 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-[0.99]">
            <CardContent className="p-3 h-full flex items-center gap-2">
              <div className="rounded-xl p-2 shrink-0 bg-slate-100 text-slate-600 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tracking-tight tabular-nums leading-tight text-slate-700">{overallSummary.attendancePct}%</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 truncate">Attendance %</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* GRID MODE: Monthly Grid */}
      {mode === 'grid' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[calc(100vh-12rem)] overflow-y-auto">
              {isLoading ? (
                <div className="p-4"><AttendanceTableSkeleton /></div>
              ) : workers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Users className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-base font-medium">No active workers</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                      <TableHead className="sticky left-0 bg-card z-10 min-w-[160px]">Worker</TableHead>
                      {daysInMonth.map((day) => (
                        <TableHead
                          key={day.toISOString()}
                          className={cn(
                            'text-center min-w-[32px] px-1 text-xs',
                            isSunday(day) && 'text-muted-foreground/50'
                          )}
                        >
                          <div>{format(day, 'dd')}</div>
                          <div className="text-[10px] font-normal">{dayName(getDay(day))}</div>
                        </TableHead>
                      ))}
                      <TableHead className="text-center bg-emerald-50 dark:bg-emerald-900/10">P</TableHead>
                      <TableHead className="text-center bg-red-50 dark:bg-red-900/10">A</TableHead>
                      <TableHead className="text-center bg-amber-50 dark:bg-amber-900/10">H</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.map((w) => {
                      const summary = workerSummary(w.id)
                      return (
                        <TableRow key={w.id}>
                          <TableCell className="sticky left-0 bg-card z-10">
                            <div>
                              <p className="font-medium text-sm">{w.fullName}</p>
                              <p className="text-xs text-muted-foreground font-mono">{w.employeeNumber}</p>
                            </div>
                          </TableCell>
                          {daysInMonth.map((day) => {
                            const status = getStatusForDate(w.id, day)
                            const sunday = isSunday(day)
                            return (
                              <TableCell
                                key={day.toISOString()}
                                className={cn(
                                  'text-center p-1',
                                  statusCellClass(status, sunday),
                                  !sunday && perms.canEdit && 'cursor-pointer hover:ring-2 hover:ring-[#0d9488]/40 transition-all'
                                )}
                                onClick={() => handleGridCellClick(w.id, day)}
                              >
                                <span className="text-xs font-medium">
                                  {statusLetter(status, sunday)}
                                </span>
                              </TableCell>
                            )
                          })}
                          <TableCell className="text-center bg-emerald-50 dark:bg-emerald-900/10">
                            <span className="text-sm font-semibold text-emerald-700">{summary.present}</span>
                          </TableCell>
                          <TableCell className="text-center bg-red-50 dark:bg-red-900/10">
                            <span className="text-sm font-semibold text-red-700">{summary.absent}</span>
                          </TableCell>
                          <TableCell className="text-center bg-amber-50 dark:bg-amber-900/10">
                            <span className="text-sm font-semibold text-amber-700">{summary.halfDay}</span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* DAY VIEW MODE */}
      {mode === 'day' && (
        <TooltipProvider>
          <Card>
            <CardHeader className="pb-3 flex flex-col xl:flex-row xl:items-start justify-between gap-4">
              <CardTitle className="text-sm flex items-center gap-2 shrink-0 xl:mt-1">
                <Users className="h-4 w-4 text-[#0d9488]" />
                Workforce
              </CardTitle>
              <div className="flex flex-col sm:flex-row flex-wrap xl:flex-nowrap items-center gap-2 w-full xl:w-auto xl:justify-end">
                <div className="relative w-full sm:w-40 xl:w-48">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-teal-600 dark:text-teal-400 pointer-events-none" />
                  <Input 
                    placeholder="Search..." 
                    className="w-full h-9 pl-9 pr-4 rounded-full text-xs font-medium bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-700 dark:text-slate-200 placeholder:text-muted-foreground placeholder:font-normal hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-teal-500/40 focus:border-teal-500/50" 
                    value={daySearch}
                    onChange={(e) => setDaySearch(e.target.value)}
                  />
                </div>
                <Select value={dayFilterContractor} onValueChange={setDayFilterContractor}>
                  <SelectTrigger className="px-4 h-9 rounded-full text-xs font-medium bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all w-full sm:w-auto min-w-[140px]">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <HardHat className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      <SelectValue placeholder="Contractor" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg border-slate-200 dark:border-slate-800">
                    <SelectItem value="all" className="text-xs cursor-pointer">All Contractors</SelectItem>
                    {contractorOptions.map(c => <SelectItem key={c} value={c} className="text-xs cursor-pointer">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={dayFilterPMC} onValueChange={setDayFilterPMC}>
                  <SelectTrigger className="px-4 h-9 rounded-full text-xs font-medium bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all w-full sm:w-auto min-w-[110px]">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Briefcase className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      <SelectValue placeholder="PMC" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg border-slate-200 dark:border-slate-800">
                    <SelectItem value="all" className="text-xs cursor-pointer">All PMC</SelectItem>
                    {PMC_OPTIONS.map(pmc => <SelectItem key={pmc} value={pmc} className="text-xs cursor-pointer">{pmc}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={dayFilterLocation} onValueChange={setDayFilterLocation}>
                  <SelectTrigger className="px-4 h-9 rounded-full text-xs font-medium bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all w-full sm:w-auto min-w-[140px]">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <MapPin className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      <SelectValue placeholder="Location" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg border-slate-200 dark:border-slate-800">
                    <SelectItem value="all" className="text-xs cursor-pointer">All Locations</SelectItem>
                    {locationOptions.map(l => <SelectItem key={l} value={l} className="text-xs cursor-pointer">{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={dayFilterStatus} onValueChange={setDayFilterStatus}>
                  <SelectTrigger className="px-4 h-9 rounded-full text-xs font-medium bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all w-full sm:w-auto min-w-[130px]">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg border-slate-200 dark:border-slate-800">
                    <SelectItem value="all" className="text-xs cursor-pointer">All Status</SelectItem>
                    <SelectItem value="Present" className="text-xs cursor-pointer">Present</SelectItem>
                    <SelectItem value="Absent" className="text-xs cursor-pointer">Absent</SelectItem>
                    <SelectItem value="HalfDay" className="text-xs cursor-pointer">Half Day</SelectItem>
                    <SelectItem value="Leave" className="text-xs cursor-pointer">Leave</SelectItem>
                    <SelectItem value="Not Marked" className="text-xs cursor-pointer">Not Marked</SelectItem>
                  </SelectContent>
                </Select>
                {(daySearch || dayFilterContractor !== 'all' || dayFilterPMC !== 'all' || dayFilterLocation !== 'all' || dayFilterStatus !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 rounded-full text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 shrink-0"
                    onClick={() => {
                      setDaySearch('')
                      setDayFilterContractor('all')
                      setDayFilterPMC('all')
                      setDayFilterLocation('all')
                      setDayFilterStatus('all')
                    }}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Clear Filters
                  </Button>
                )}
                {perms.canEdit && (
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 flex-1 sm:flex-none"
                      onClick={() => bulkMarkMutation.mutate('Present')}
                      disabled={bulkMarkMutation.isPending || markMutation.isPending}
                    >
                      {bulkMarkMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 sm:mr-1.5 animate-spin" />
                      ) : (
                        <UserCheck className="h-3.5 w-3.5 sm:mr-1.5" />
                      )}
                      <span className="hidden sm:inline">
                        {selectedWorkerIds.size > 0 ? `Mark ${selectedWorkerIds.size} Present` : 'Mark All Present'}
                      </span>
                      <span className="sm:hidden">Present</span>
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white h-8 flex-1 sm:flex-none"
                      onClick={() => bulkMarkMutation.mutate('Absent')}
                      disabled={bulkMarkMutation.isPending || markMutation.isPending}
                    >
                      {bulkMarkMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 sm:mr-1.5 animate-spin" />
                      ) : (
                        <UserX className="h-3.5 w-3.5 sm:mr-1.5" />
                      )}
                      <span className="hidden sm:inline">
                        {selectedWorkerIds.size > 0 ? `Mark ${selectedWorkerIds.size} Absent` : 'Mark All Absent'}
                      </span>
                      <span className="sm:hidden">Absent</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : workers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Users className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No active workers</p>
                </div>
              ) : !isSameMonth ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CalendarDays className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">Selected date is not in the current view month</p>
                  <p className="text-xs text-muted-foreground mt-1">Use the month navigator to switch to the correct month</p>
                </div>
              ) : (
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow>
                        <TableHead className="w-[40px] px-3">
                          <Checkbox 
                            checked={filteredDayWorkers.length > 0 && selectedWorkerIds.size === filteredDayWorkers.length ? true : selectedWorkerIds.size > 0 ? 'indeterminate' : false}
                            onCheckedChange={toggleSelectAll}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead className="w-[15%] whitespace-nowrap">Employee No</TableHead>
                        <TableHead className="w-[15%]">Worker Name</TableHead>
                        <TableHead className="w-[15%]">Designation</TableHead>
                        <TableHead className="w-[15%]">Contractor</TableHead>
                        <TableHead className="w-[15%]">PMC</TableHead>
                        <TableHead className="w-[15%]">Location</TableHead>
                        <TableHead className="w-[100px] text-center">Status</TableHead>
                        <TableHead className="w-[160px] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDayWorkers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                            No workers found matching your filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDayWorkers.map((w) => {
                          const currentStatus = getStatusForDate(w.id, selectedDate)
                        let badgeClass = 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        let badgeLabel = 'Not Marked'
                        if (currentStatus === 'Present') {
                          badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                          badgeLabel = 'Present'
                        } else if (currentStatus === 'Absent') {
                          badgeClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          badgeLabel = 'Absent'
                        } else if (currentStatus === 'HalfDay') {
                          badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          badgeLabel = 'Half Day'
                        } else if (currentStatus === 'Leave') {
                          badgeClass = 'bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400'
                          badgeLabel = 'Leave'
                        }
                        
                        return (
                          <TableRow key={w.id} className={cn(selectedWorkerIds.has(w.id) && 'bg-slate-50 dark:bg-slate-800/50')}>
                            <TableCell className="px-3">
                              <Checkbox 
                                checked={selectedWorkerIds.has(w.id)}
                                onCheckedChange={() => toggleWorkerSelection(w.id)}
                                aria-label={`Select ${w.fullName}`}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-muted-foreground text-xs">{w.employeeNumber}</TableCell>
                            <TableCell>
                              <p className="font-medium text-sm truncate max-w-[200px]">{w.fullName}</p>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs truncate">{w.designation?.name || '—'}</TableCell>
                            <TableCell className="text-muted-foreground text-xs truncate">{w.contractor?.name || '—'}</TableCell>
                            <TableCell className="text-muted-foreground text-xs truncate">{getPMCForWorker(w.id)}</TableCell>
                            <TableCell className="text-muted-foreground text-xs truncate">{w.site?.name || w.labourCamp?.name || '—'}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={cn('border-0 font-medium', badgeClass)}>
                                {badgeLabel}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {perms.canEdit && (
                                <div className="flex items-center justify-center gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant={currentStatus === 'Present' ? 'default' : 'ghost'}
                                        className={cn(
                                          'h-7 w-7',
                                          currentStatus === 'Present'
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                            : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                                        )}
                                        onClick={() => handleQuickMark(w.id, 'Present')}
                                        disabled={markMutation.isPending}
                                      >
                                        <UserCheck className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Present</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant={currentStatus === 'Absent' ? 'default' : 'ghost'}
                                        className={cn(
                                          'h-7 w-7',
                                          currentStatus === 'Absent'
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                        )}
                                        onClick={() => handleQuickMark(w.id, 'Absent')}
                                        disabled={markMutation.isPending}
                                      >
                                        <UserX className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Absent</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant={currentStatus === 'HalfDay' ? 'default' : 'ghost'}
                                        className={cn(
                                          'h-7 w-7',
                                          currentStatus === 'HalfDay'
                                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                            : 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                                        )}
                                        onClick={() => handleQuickMark(w.id, 'HalfDay')}
                                        disabled={markMutation.isPending}
                                      >
                                        <Clock className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Half Day</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant={currentStatus === 'Leave' ? 'default' : 'ghost'}
                                        className={cn(
                                          'h-7 w-7',
                                          currentStatus === 'Leave'
                                            ? 'bg-slate-600 hover:bg-slate-700 text-white'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                        )}
                                        onClick={() => handleQuickMark(w.id, 'Leave')}
                                        disabled={markMutation.isPending}
                                      >
                                        <Coffee className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Leave</TooltipContent>
                                  </Tooltip>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipProvider>
      )}

      {/* QUICK MARK MODE */}
      {mode === 'quick' && perms.canEdit && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#0d9488]" />
                Marking attendance for {format(selectedDate, 'EEEE, dd MMM yyyy')}
                {isSunday(selectedDate) && (
                  <Badge variant="outline" className="status-pending text-xs">Sunday</Badge>
                )}
              </CardTitle>
            </CardHeader>
            {/* Bulk Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => bulkMarkMutation.mutate('Present')}
                disabled={bulkMarkMutation.isPending || markMutation.isPending}
              >
                {bulkMarkMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                )}
                Mark All Present
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => bulkMarkMutation.mutate('Absent')}
                disabled={bulkMarkMutation.isPending || markMutation.isPending}
              >
                {bulkMarkMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <UserX className="h-3.5 w-3.5 mr-1.5" />
                )}
                Mark All Absent
              </Button>
              <Button
                size="sm"
                className="bg-slate-600 hover:bg-slate-700 text-white"
                onClick={() => bulkMarkMutation.mutate('Leave')}
                disabled={bulkMarkMutation.isPending || markMutation.isPending}
              >
                {bulkMarkMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Coffee className="h-3.5 w-3.5 mr-1.5" />
                )}
                Mark All Leave
              </Button>
            </div>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-5 w-40" />
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : workers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Users className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No active workers</p>
                </div>
              ) : (
                <div className="divide-y max-h-[calc(100vh-12rem)] overflow-y-auto">
                  {workers.map((w) => {
                    const currentStatus = isSameMonth
                      ? getStatusForDate(w.id, selectedDate)
                      : null
                    return (
                      <div
                        key={w.id}
                        className="flex items-center justify-between p-3 sm:px-4 gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{w.fullName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{w.employeeNumber}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant={currentStatus === 'Present' ? 'default' : 'outline'}
                            className={cn(
                              'h-8 w-20',
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'text-emerald-600 border-emerald-300 hover:bg-emerald-50'
                            )}
                            onClick={() => handleQuickMark(w.id, 'Present')}
                            disabled={markMutation.isPending}
                          >
                            <UserCheck className="h-3.5 w-3.5 mr-1" />
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === 'Absent' ? 'default' : 'outline'}
                            className={cn(
                              'h-8 w-16',
                              currentStatus === 'Absent'
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'text-red-600 border-red-300 hover:bg-red-50'
                            )}
                            onClick={() => handleQuickMark(w.id, 'Absent')}
                            disabled={markMutation.isPending}
                          >
                            <UserX className="h-3.5 w-3.5 mr-1" />
                            Absent
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === 'HalfDay' ? 'default' : 'outline'}
                            className={cn(
                              'h-8 w-20',
                              currentStatus === 'HalfDay'
                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                : 'text-amber-600 border-amber-300 hover:bg-amber-50'
                            )}
                            onClick={() => handleQuickMark(w.id, 'HalfDay')}
                            disabled={markMutation.isPending}
                          >
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Half Day
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === 'Leave' ? 'default' : 'outline'}
                            className={cn(
                              'h-8 w-16',
                              currentStatus === 'Leave'
                                ? 'bg-slate-600 hover:bg-slate-700 text-white'
                                : 'text-slate-500 border-slate-300 hover:bg-slate-50'
                            )}
                            onClick={() => handleQuickMark(w.id, 'Leave')}
                            disabled={markMutation.isPending}
                          >
                            <Coffee className="h-3.5 w-3.5 mr-1" />
                            Leave
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}


    </div>
  )
}
