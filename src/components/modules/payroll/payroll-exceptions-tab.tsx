'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Filter,
  X,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PayrollExceptionItem, ExceptionSeverity } from '@/types/payroll'

interface PayrollExceptionsTabProps {
  period: string
  onNavigateTab: (tabId: string) => void
}

export default function PayrollExceptionsTab({
  period,
  onNavigateTab,
}: PayrollExceptionsTabProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const { data: resp, isLoading } = useQuery<{
    data: {
      period: string
      counts: {
        total: number
        critical: number
        high: number
        medium: number
        low: number
        salary: number
        epf: number
      }
      exceptions: PayrollExceptionItem[]
    }
  }>({
    queryKey: ['payroll-exceptions', period, categoryFilter, severityFilter],
    queryFn: () =>
      fetch(`/api/payroll/exceptions?period=${period}&category=${categoryFilter}&severity=${severityFilter}`).then(r => r.json()),
  })

  const counts = resp?.data?.counts
  const exceptions = resp?.data?.exceptions ?? []

  const getSeverityBadge = (severity: ExceptionSeverity) => {
    switch (severity) {
      case 'Critical':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-300 font-bold text-[11px]">CRITICAL</Badge>
      case 'High':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300 font-bold text-[11px]">HIGH</Badge>
      case 'Medium':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border-orange-300 font-bold text-[11px]">MEDIUM</Badge>
      default:
        return <Badge variant="outline" className="text-slate-600 font-bold text-[11px]">LOW</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Severity Counters */}
      {counts && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card
            className={`p-3 cursor-pointer transition-colors ${severityFilter === 'Critical' ? 'ring-2 ring-red-500' : 'hover:border-red-300'}`}
            onClick={() => setSeverityFilter(severityFilter === 'Critical' ? 'all' : 'Critical')}
          >
            <div className="flex items-center justify-between text-red-600 dark:text-red-400">
              <span className="text-xs font-bold uppercase tracking-wider">Critical</span>
              <ShieldAlert className="h-4 w-4" />
            </div>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400 block mt-1">
              {counts.critical}
            </span>
            <span className="text-[10px] text-muted-foreground">Overdue / Unrecorded</span>
          </Card>

          <Card
            className={`p-3 cursor-pointer transition-colors ${severityFilter === 'High' ? 'ring-2 ring-amber-500' : 'hover:border-amber-300'}`}
            onClick={() => setSeverityFilter(severityFilter === 'High' ? 'all' : 'High')}
          >
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider">High</span>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 block mt-1">
              {counts.high}
            </span>
            <span className="text-[10px] text-muted-foreground">Missing UAN / Proofs</span>
          </Card>

          <Card
            className={`p-3 cursor-pointer transition-colors ${severityFilter === 'Medium' ? 'ring-2 ring-orange-500' : 'hover:border-orange-300'}`}
            onClick={() => setSeverityFilter(severityFilter === 'Medium' ? 'all' : 'Medium')}
          >
            <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
              <span className="text-xs font-bold uppercase tracking-wider">Medium</span>
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400 block mt-1">
              {counts.medium}
            </span>
            <span className="text-[10px] text-muted-foreground">Late / Pending Verification</span>
          </Card>

          <Card
            className={`p-3 cursor-pointer transition-colors ${severityFilter === 'all' ? 'ring-2 ring-teal-500' : 'hover:border-teal-300'}`}
            onClick={() => { setSeverityFilter('all'); setCategoryFilter('all') }}
          >
            <div className="flex items-center justify-between text-[#0d9488]">
              <span className="text-xs font-bold uppercase tracking-wider">Total Exceptions</span>
              <AlertCircle className="h-4 w-4" />
            </div>
            <span className="text-2xl font-bold text-foreground block mt-1">
              {counts.total}
            </span>
            <span className="text-[10px] text-muted-foreground">Across Salary & EPF</span>
          </Card>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Categories</SelectItem>
            <SelectItem value="Salary" className="text-xs">Salary</SelectItem>
            <SelectItem value="EPF" className="text-xs">EPF</SelectItem>
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Severities</SelectItem>
            <SelectItem value="Critical" className="text-xs">Critical</SelectItem>
            <SelectItem value="High" className="text-xs">High</SelectItem>
            <SelectItem value="Medium" className="text-xs">Medium</SelectItem>
          </SelectContent>
        </Select>

        {(severityFilter !== 'all' || categoryFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSeverityFilter('all'); setCategoryFilter('all') }}
            className="h-8 text-xs text-muted-foreground"
          >
            <X className="h-3 w-3 mr-1" /> Reset Filters
          </Button>
        )}
      </div>

      {/* Exceptions List */}
      <div className="space-y-3">
        {exceptions.length === 0 ? (
          <Card className="p-12 text-center text-xs text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-foreground text-sm">No exceptions found</p>
            <p className="mt-1">All payroll records for this period match statutory guidelines.</p>
          </Card>
        ) : (
          exceptions.map((ex) => (
            <Card key={ex.id} className="p-4 hover:border-teal-500/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getSeverityBadge(ex.severity)}
                    <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider">
                      {ex.category}
                    </Badge>
                    <span className="font-bold text-sm text-foreground">{ex.title}</span>
                  </div>

                  <p className="text-xs text-muted-foreground">{ex.description}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs pt-1">
                    {ex.workerName && (
                      <span className="font-medium text-foreground">
                        Worker: <span className="font-semibold">{ex.workerName}</span> ({ex.employeeNumber})
                      </span>
                    )}
                    {ex.contractor && (
                      <span className="text-muted-foreground">
                        Contractor: <span className="font-medium text-foreground">{ex.contractor}</span>
                      </span>
                    )}
                    {ex.site && (
                      <span className="text-muted-foreground">
                        Site: <span className="font-medium text-foreground">{ex.site}</span>
                      </span>
                    )}
                    {ex.amount !== undefined && ex.amount !== null && (
                      <span className="text-muted-foreground font-mono">
                        Amount: <span className="font-bold text-foreground">₹{ex.amount.toLocaleString('en-IN')}</span>
                      </span>
                    )}
                    {ex.dueDate && (
                      <span className="text-red-600 font-mono text-[11px]">
                        Due: {new Date(ex.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-[#0d9488] text-[#0d9488] hover:bg-teal-50 dark:hover:bg-teal-950/30"
                    onClick={() => onNavigateTab(ex.actionTab)}
                  >
                    View Record <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
